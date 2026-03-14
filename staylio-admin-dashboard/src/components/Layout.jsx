import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminBackground from './AdminBackground';



const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <AdminBackground>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="flex items-center justify-end px-8 py-6 z-10">
            <div className="flex items-center gap-6 ml-6">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user?.name || 'Administrator'}</p>
                  <p className="text-xs text-slate-400">{user?.role || 'Super Admin'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] flex items-center justify-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/kdduutaw.json"
                    trigger="hover"
                    colors="primary:#60a5fa,secondary:#818cf8"
                    style={{ width: '36px', height: '36px' }}
                  ></lord-icon>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminBackground>
  );
};

export default Layout;


