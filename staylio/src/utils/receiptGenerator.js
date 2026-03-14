import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceipt = (booking, hotel) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const brandColor = [132, 0, 255]; // #8400ff (StayLio accent approx)
  const secondaryColor = [100, 100, 100];
  const darkColor = [20, 20, 20];
  
  // Helper for right aligned text
  const rightText = (text, y) => {
    doc.text(text, pageWidth - 20, y, { align: 'right' });
  };
  
  // --- HEADER ---
  // Logo Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...brandColor);
  doc.text('StayLio', 20, 25);
  
  // Receipt Title
  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  rightText('BOOKING RECEIPT', 22);
  
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  rightText('Official Payment Confirmation', 28);
  
  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(20, 35, pageWidth - 20, 35);
  
  let currentY = 50;
  
  // --- BOOKING SUMMARY ---
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text('BOOKING REFERENCE', 20, currentY);
  rightText('STATUS', currentY);
  
  currentY += 6;
  doc.setFontSize(12);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.bookingReference || `BD-${booking.id}`, 20, currentY);
  
  const statusColor = booking.status === 'CONFIRMED' ? [34, 197, 94] : [100, 100, 100];
  doc.setTextColor(...statusColor);
  rightText(booking.status, currentY);
  
  currentY += 10;
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('DATE', 20, currentY);
  rightText('PAYMENT METHOD', currentY);
  
  currentY += 6;
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text(new Date(booking.checkInDate).toLocaleDateString(), 20, currentY); // Using Check-in as generic date ref if created_at not avail
  rightText(booking.paymentMethod || 'Online', currentY);
  
  // Divider
  currentY += 15;
  doc.setDrawColor(240, 240, 240);
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 15;
  
  // --- HOTEL & GUEST DETAILS (Two Columns) ---
  const leftColX = 20;
  const rightColX = pageWidth / 2 + 10;
  
  // Hotel Details
  doc.setFontSize(10);
  doc.setTextColor(...brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('HOTEL DETAILS', leftColX, currentY);
  
  currentY += 8;
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text(hotel?.name || booking.hotelName || 'Hotel Name', leftColX, currentY);
  
  currentY += 6;
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  // Handle address wrapping
  const address = hotel?.address || 'Address not available';
  const cityState = `${hotel?.city || ''}, ${hotel?.state || ''}, ${hotel?.country || ''}`;
  const fullAddress = `${address}\n${cityState}`;
  doc.text(fullAddress, leftColX, currentY, { maxWidth: 80 });
  
  // Guest Details (Aligned to right column)
  // Reset Y for right column start
  let rightColY = currentY - 14; 
  
  doc.setFontSize(10);
  doc.setTextColor(...brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('GUEST DETAILS', rightColX, rightColY);
  
  rightColY += 8;
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text(booking.guestName || 'Guest', rightColX, rightColY);
  
  rightColY += 6;
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.guestEmail || '', rightColX, rightColY);
  rightColY += 5;
  doc.text(booking.guestPhone || '', rightColX, rightColY);
  
  // Adjust currentY to be below the lowest column
  currentY = Math.max(currentY + 20, rightColY + 20); // Add cushion
  
  // --- STAY DETAILS ---
  doc.setFontSize(10);
  doc.setTextColor(...brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('STAY DETAILS', 20, currentY);
  
  currentY += 10;
  
  // Create a grid for stay details
  const details = [
    ['Check-in', new Date(booking.checkInDate).toLocaleDateString()],
    ['Check-out', new Date(booking.checkOutDate).toLocaleDateString()],
    ['Nights', `${booking.totalNights} Nights`],
    ['Guests', `${booking.guests} Guests`]
  ];
  
  let xOffset = 20;
  details.forEach(([label, value]) => {
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text(label.toUpperCase(), xOffset, currentY);
    
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(value, xOffset, currentY + 6);
    
    xOffset += 45;
  });
  
  currentY += 20;
  
  // --- PAYMENT BREAKDOWN (Table) ---
  const tableData = [
    [
      `Room Charges (${booking.roomType || 'Standard'} x ${booking.rooms || 1})`, 
      `${booking.totalNights} Nights`, 
      `INR ${booking.pricePerNight}`, 
      `INR ${booking.totalAmount}` // Assuming totalAmount is inclusive or close
    ]
  ];
  
  // If we had tax info explicitly, we'd add it. For now, assuming totalAmount includes tax
  // We can simulate a breakdown if needed, but safer to just show what we have.
  // Prompt asks for: Price per Night, Number of Nights, Subtotal, Tax, Total.
  
  // Let's create a derived breakdown if we can
  const subtotal = booking.pricePerNight * booking.totalNights * (booking.rooms || 1);
  const taxes = booking.totalAmount - subtotal;
  const hasTax = taxes > 0;
  
  // Clearer data for table
  const body = [
      [
          `Room Charge (${booking.roomType || 'Room'} x ${booking.rooms || 1})`,
          `${booking.totalNights}`,
          `INR ${booking.pricePerNight}`,
          `INR ${subtotal.toFixed(2)}`
      ]
  ];
  
  if (hasTax) {
      body.push([
          'Taxes & Fees',
          '-',
          '-',
          `INR ${taxes.toFixed(2)}`
      ]);
  }
  
  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Nights', 'Rate/Night', 'Amount']],
    body: body,
    foot: [['', '', 'TOTAL PAID', `INR ${booking.totalAmount}`]],
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: darkColor
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: secondaryColor,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: brandColor,
      fontStyle: 'bold',
      fontSize: 12
    },
    columnStyles: {
        3: { halign: 'right' },
        2: { halign: 'right' },
        1: { halign: 'center' }
    }
  });
  
  currentY = (doc.lastAutoTable?.finalY || currentY) + 20;
  
  // --- WALLET / TRANSACTION INFO ---
  doc.setDrawColor(240, 240, 240);
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;
  
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('PAYMENT DETAILS', 20, currentY);
  
  currentY += 8;
  doc.text(`Transaction ID: ${booking.razorpayPaymentId || 'N/A'}`, 20, currentY);
  doc.text(`Paid via: StayLio Secure Payment`, 20, currentY + 5);
  doc.text(`Payment Status: ${booking.paymentStatus || 'PAID'}`, 20, currentY + 10);
  // doc.text(`Payment Received By: StayLio Admin`, 20, currentY + 10);
  
  // --- FOOTER ---
  const footerY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setTextColor(...brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for choosing StayLio', pageWidth / 2, footerY, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text('support@staylio.com | www.staylio.com', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text('This is a system-generated receipt and does not require a signature.', pageWidth / 2, footerY + 10, { align: 'center' });
  
  // Save
  doc.save(`StayLio_Receipt_${booking.bookingReference || booking.id}.pdf`);
};
