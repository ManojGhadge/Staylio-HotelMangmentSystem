# AWS Deployment Guide for StayLio Hotel Booking Platform

This guide provides step-by-step instructions to deploy the StayLio hotel booking platform on Amazon Web Services (AWS) using containerized services.

## 🏗️ Architecture Overview

The deployment will use the following AWS services:
- **ECS Fargate**: Serverless container orchestration
- **RDS MySQL**: Managed database
- **ECR**: Container registry
- **Application Load Balancer**: Load balancing and SSL termination
- **VPC**: Networking isolation
- **CloudWatch**: Monitoring and logging

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **Git** for cloning repositories
5. **Domain name** (optional, for custom domain)
6. **GROQ API Key** for AI agent functionality
7. **Email credentials** for SMTP (Gmail app password recommended)

### API Keys and Secrets Setup

#### GROQ API Key
1. Sign up at [GROQ](https://groq.com/)
2. Generate an API key
3. Store securely for use in AI agent configuration

#### Email Configuration
1. Use Gmail with app password for production
2. Go to Google Account settings > Security > App passwords
3. Generate app password for "StayLio"
4. Use this password in email configuration

## 🚀 Deployment Steps

### Step 1: Set Up AWS Environment

#### 1.1 Create VPC and Networking
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text

# Create subnets (adjust availability zones as needed)
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create Internet Gateway
aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text
aws ec2 attach-internet-gateway --vpc-id <vpc-id> --internet-gateway-id <igw-id>

# Create route table and routes
aws ec2 create-route-table --vpc-id <vpc-id> --query RouteTable.RouteTableId --output text
aws ec2 create-route --route-table-id <rt-id> --destination-cidr-block 0.0.0.0/0 --gateway-id <igw-id>

# Associate subnets with route table
aws ec2 associate-route-table --subnet-id <subnet-1-id> --route-table-id <rt-id>
aws ec2 associate-route-table --subnet-id <subnet-2-id> --route-table-id <rt-id>
```

#### 1.2 Create Security Groups
```bash
# Security group for ALB
aws ec2 create-security-group --group-name staylio-alb-sg --description "ALB Security Group" --vpc-id <vpc-id>

# Allow HTTP and HTTPS
aws ec2 authorize-security-group-ingress --group-id <alb-sg-id> --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id <alb-sg-id> --protocol tcp --port 443 --cidr 0.0.0.0/0

# Security group for ECS tasks
aws ec2 create-security-group --group-name staylio-ecs-sg --description "ECS Tasks Security Group" --vpc-id <vpc-id>

# Allow traffic from ALB
aws ec2 authorize-security-group-ingress --group-id <ecs-sg-id> --protocol tcp --port 80 --source-group <alb-sg-id>
aws ec2 authorize-security-group-ingress --group-id <ecs-sg-id> --protocol tcp --port 8080 --source-group <alb-sg-id>
aws ec2 authorize-security-group-ingress --group-id <ecs-sg-id> --protocol tcp --port 5000 --source-group <alb-sg-id>

# Security group for RDS
aws ec2 create-security-group --group-name staylio-rds-sg --description "RDS Security Group" --vpc-id <vpc-id>

# Allow MySQL traffic from ECS tasks
aws ec2 authorize-security-group-ingress --group-id <rds-sg-id> --protocol tcp --port 3306 --source-group <ecs-sg-id>
```

### Step 2: Set Up RDS MySQL Database

```bash
# Create RDS subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name staylio-db-subnet-group \
    --db-subnet-group-description "StayLio DB subnet group" \
    --subnet-ids <subnet-1-id> <subnet-2-id>

# Create RDS MySQL instance
aws rds create-db-instance \
    --db-instance-identifier staylio-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0 \
    --master-username admin \
    --master-user-password <your-db-password> \
    --allocated-storage 20 \
    --vpc-security-group-ids <rds-sg-id> \
    --db-subnet-group-name staylio-db-subnet-group \
    --backup-retention-period 7 \
    --no-publicly-accessible
```

### Step 3: Create ECR Repositories

```bash
# Create ECR repositories for each service
aws ecr create-repository --repository-name staylio/backend --region us-east-1
aws ecr create-repository --repository-name staylio/ai-agent --region us-east-1
aws ecr create-repository --repository-name staylio/frontend-user --region us-east-1
aws ecr create-repository --repository-name staylio/frontend-admin --region us-east-1
aws ecr create-repository --repository-name staylio/frontend-host --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Step 4: Build and Push Docker Images

#### 4.1 Backend Service
```bash
cd staylio-backend

# Build image
docker build -t staylio-backend .

# Tag image
docker tag staylio-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/staylio/backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/staylio/backend:latest
```

#### 4.2 AI Agent Service
```bash
cd staylio-ai-agent

# Build image
docker build -t staylio-ai-agent .

# Tag and push
docker tag staylio-ai-agent:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/staylio/ai-agent:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/staylio/ai-agent:latest
```

#### 4.3 Frontend Services
**Important**: Update the API base URL in Dockerfiles for production.

For each frontend service, modify the Dockerfile build args:
```dockerfile
ARG VITE_API_BASE_URL=http://<alb-dns-name>/api
```

Or rebuild with:
```bash
# User Frontend
cd staylio
docker build --build-arg VITE_API_BASE_URL=http://<alb-dns-name>/api -t staylio-frontend-user .
# ... (similar for others)
```

Then tag and push as before.

### Step 5: Create ECS Cluster and Services

#### 5.1 Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name staylio-cluster
```

#### 5.2 Create Task Execution Role
```bash
# Create IAM role for ECS task execution
aws iam create-role --role-name ecsTaskExecutionRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ecs-tasks.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'

# Attach managed policy
aws iam attach-role-policy --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### 5.3 Create Task Definitions

Create `backend-task-definition.json`:
```json
{
    "family": "staylio-backend",
    "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
    "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "512",
    "memory": "1024",
    "containerDefinitions": [
        {
            "name": "backend",
            "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/staylio/backend:latest",
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 8080,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "SPRING_DATASOURCE_URL",
                    "value": "jdbc:mysql://<rds-endpoint>:3306/staylio_database"
                },
                {
                    "name": "SPRING_DATASOURCE_USERNAME",
                    "value": "admin"
                },
                {
                    "name": "SPRING_DATASOURCE_PASSWORD",
                    "value": "<db-password>"
                },
                {
                    "name": "SPRING_JPA_HIBERNATE_DDL_AUTO",
                    "value": "update"
                },
                {
                    "name": "SPRING_MAIL_HOST",
                    "value": "smtp.gmail.com"
                },
                {
                    "name": "SPRING_MAIL_PORT",
                    "value": "587"
                },
                {
                    "name": "SPRING_MAIL_USERNAME",
                    "value": "<your-email@gmail.com>"
                },
                {
                    "name": "SPRING_MAIL_PASSWORD",
                    "value": "<your-app-password>"
                },
                {
                    "name": "SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH",
                    "value": "true"
                },
                {
                    "name": "SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE",
                    "value": "true"
                },
                {
                    "name": "SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_REQUIRED",
                    "value": "true"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/staylio-backend",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
```

Create `ai-agent-task-definition.json`:
```json
{
    "family": "staylio-ai-agent",
    "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
    "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "containerDefinitions": [
        {
            "name": "ai-agent",
            "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/staylio/ai-agent:latest",
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 5000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "DB_HOST",
                    "value": "<rds-endpoint>"
                },
                {
                    "name": "DB_USER",
                    "value": "admin"
                },
                {
                    "name": "DB_PASSWORD",
                    "value": "<db-password>"
                },
                {
                    "name": "DB_NAME",
                    "value": "staylio_database"
                },
                {
                    "name": "GROQ_API_KEY",
                    "value": "<your-groq-api-key>"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/staylio-ai-agent",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
```

Create separate task definitions for each frontend service, updating the image URI accordingly.

Example for user frontend (`frontend-user-task-definition.json`):
```json
{
    "family": "staylio-frontend-user",
    "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
    "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "containerDefinitions": [
        {
            "name": "frontend",
            "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/staylio/frontend-user:latest",
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 80,
                    "protocol": "tcp"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/staylio-frontend-user",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
```

Create similar task definitions for `frontend-admin` and `frontend-host` services.

Register task definitions:
```bash
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
aws ecs register-task-definition --cli-input-json file://ai-agent-task-definition.json
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json
```

### Step 6: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name staylio-alb \
    --subnets <subnet-1-id> <subnet-2-id> \
    --security-groups <alb-sg-id>

# Create target groups for each frontend
aws elbv2 create-target-group \
    --name staylio-frontend-user-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id <vpc-id> \
    --target-type ip

aws elbv2 create-target-group \
    --name staylio-frontend-admin-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id <vpc-id> \
    --target-type ip

aws elbv2 create-target-group \
    --name staylio-frontend-host-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id <vpc-id> \
    --target-type ip

# Create listeners and rules
aws elbv2 create-listener \
    --load-balancer-arn <alb-arn> \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=<frontend-user-tg-arn>

# Add rules for different paths
aws elbv2 create-rule \
    --listener-arn <listener-arn> \
    --priority 10 \
    --conditions Field=path-pattern,Values='/api/*' \
    --actions Type=forward,TargetGroupArn=<backend-tg-arn>

aws elbv2 create-rule \
    --listener-arn <listener-arn> \
    --priority 20 \
    --conditions Field=path-pattern,Values='/ai/*' \
    --actions Type=forward,TargetGroupArn=<ai-agent-tg-arn>

aws elbv2 create-rule \
    --listener-arn <listener-arn> \
    --priority 30 \
    --conditions Field=path-pattern,Values='/admin/*' \
    --actions Type=forward,TargetGroupArn=<frontend-admin-tg-arn>

aws elbv2 create-rule \
    --listener-arn <listener-arn> \
    --priority 40 \
    --conditions Field=path-pattern,Values='/host/*' \
    --actions Type=forward,TargetGroupArn=<frontend-host-tg-arn>
```

### Step 7: Create ECS Services

```bash
# Backend service
aws ecs create-service \
    --cluster staylio-cluster \
    --service-name staylio-backend-service \
    --task-definition staylio-backend \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<subnet-1-id>,<subnet-2-id>],securityGroups=[<ecs-sg-id>],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=<backend-tg-arn>,containerName=backend,containerPort=8080"

# AI Agent service
aws ecs create-service \
    --cluster staylio-cluster \
    --service-name staylio-ai-agent-service \
    --task-definition staylio-ai-agent \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<subnet-1-id>,<subnet-2-id>],securityGroups=[<ecs-sg-id>],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=<ai-agent-tg-arn>,containerName=ai-agent,containerPort=5000"

# Frontend services (create separate services for each frontend)
aws ecs create-service \
    --cluster staylio-cluster \
    --service-name staylio-frontend-user-service \
    --task-definition staylio-frontend-user \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[<subnet-1-id>,<subnet-2-id>],securityGroups=[<ecs-sg-id>],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=<frontend-user-tg-arn>,containerName=frontend,containerPort=80"

# Create separate target groups and services for admin and host frontends
# Update ALB rules to route based on paths (e.g., /admin/* -> admin frontend, /host/* -> host frontend)
```

### Step 8: Database Initialization

After the RDS instance is available, connect and run the SQL scripts:

```bash
# Get RDS endpoint
aws rds describe-db-instances --db-instance-identifier staylio-db --query 'DBInstances[0].Endpoint.Address'

# Connect to database and run scripts
mysql -h <rds-endpoint> -u admin -p
CREATE DATABASE staylio_database;
USE staylio_database;
SOURCE setup-admin-database.sql;
SOURCE setup-hotel-claiming.sql;
SOURCE setup-payment-integration.sql;
```

### Step 9: Configure SSL (Optional)

```bash
# Request SSL certificate (if using custom domain)
aws acm request-certificate --domain-name yourdomain.com --validation-method DNS

# Create HTTPS listener
aws elbv2 create-listener \
    --load-balancer-arn <alb-arn> \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=<certificate-arn> \
    --default-actions Type=forward,TargetGroupArn=<frontend-tg-arn>
```

### Step 10: Monitoring and Logging

```bash
# Create CloudWatch log groups
aws logs create-log-group --log-group-name /ecs/staylio-backend
aws logs create-log-group --log-group-name /ecs/staylio-ai-agent
aws logs create-log-group --log-group-name /ecs/staylio-frontend

# Set up CloudWatch alarms (optional)
aws cloudwatch put-metric-alarm \
    --alarm-name "ECS CPU Utilization" \
    --alarm-description "ECS CPU utilization alarm" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ClusterName,Value=staylio-cluster Name=ServiceName,Value=staylio-backend-service
```

## 🔧 Configuration Management

### Environment Variables

Create environment-specific configurations:

- **Production**: Use AWS Systems Manager Parameter Store or Secrets Manager
- **Staging**: Use separate parameter sets
- **Development**: Use local environment files

### Secrets Management

Store sensitive data in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
    --name staylio/db-password \
    --secret-string '{"password":"<db-password>"}'

aws secretsmanager create-secret \
    --name staylio/email-credentials \
    --secret-string '{"username":"your-email@gmail.com","password":"your-app-password"}'
```

## 🚀 Deployment Automation

### Using AWS CDK

Consider using AWS CDK for infrastructure as code:

```typescript
// Example CDK stack
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class StaylioStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'StaylioVpc', {
      maxAzs: 2
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'StaylioCluster', {
      vpc
    });

    // Add your services here...
  }
}
```

### CI/CD Pipeline

Set up automated deployment using GitHub Actions or AWS CodePipeline.

## 📊 Cost Optimization

- Use Fargate Spot for non-critical workloads
- Right-size ECS task CPU/memory allocations
- Use RDS reserved instances for production
- Implement auto-scaling based on demand
- Monitor and optimize ECR storage costs

## 🔒 Security Best Practices

- Use IAM roles with least privilege
- Enable VPC flow logs
- Implement AWS WAF for ALB
- Regular security patching
- Enable encryption at rest and in transit
- Use AWS Config for compliance monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Container fails to start**: Check CloudWatch logs for application errors
2. **Database connection issues**: Verify security groups and RDS endpoint
3. **Load balancer health checks failing**: Ensure health check paths are correct
4. **Image pull errors**: Verify ECR permissions and repository existence

### Monitoring Commands

```bash
# Check service status
aws ecs describe-services --cluster staylio-cluster --services staylio-backend-service

# View logs
aws logs tail /ecs/staylio-backend --follow

# Check ALB health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

## 📞 Support

For issues with this deployment guide:
1. Check AWS documentation
2. Review CloudWatch logs
3. Verify IAM permissions
4. Ensure all prerequisites are met

---

**Note**: Replace `<account-id>`, `<vpc-id>`, `<subnet-ids>`, `<rds-endpoint>`, etc. with actual values from your AWS environment.

## 🎉 Post-Deployment

After successful deployment:

1. **Get ALB DNS name**:
   ```bash
   aws elbv2 describe-load-balancers --names staylio-alb --query 'LoadBalancers[0].DNSName'
   ```

2. **Access URLs**:
   - User Dashboard: `http://<alb-dns-name>/`
   - Admin Dashboard: `http://<alb-dns-name>/admin/`
   - Host Dashboard: `http://<alb-dns-name>/host/`
   - Backend API: `http://<alb-dns-name>/api/`
   - AI Agent: `http://<alb-dns-name>/ai/`

3. **Default Admin Credentials**:
   - Email: `admin@staylio.com`
   - Password: `admin123`

4. **Verify Database Setup**: Ensure all SQL scripts have been executed on the RDS instance.

The deployment guide is now complete! The StayLio hotel booking platform should be fully operational on AWS.