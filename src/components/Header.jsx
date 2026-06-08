import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Search,
  NotificationsNone,
  DarkModeOutlined,
  LightModeOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  LogoutOutlined,
  Menu,
} from '@mui/icons-material';
import { Select, MenuItem, FormControl } from '@mui/material';


const Header = ({ onMenuClick, isDesktopSidebarOpen, toggleDesktopSidebar }) => {
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode, lang, setLang, t } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`h-16 flex items-center justify-between px-4 lg:px-6 transition-colors ${darkMode ? 'bg-[#18181b] border-b border-[#27272a]' : 'bg-[#f1f5f9]'}`}>
      <div className="flex items-center gap-2 lg:gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl shadow-sm ${darkMode ? 'bg-[#1f1f23] text-zinc-300' : 'bg-white text-gray-500'}`}
        >
          <Menu />
        </button>

        <button
          onClick={toggleDesktopSidebar}
          className={`hidden lg:flex w-8 h-8 items-center justify-center rounded-lg shadow-sm shrink-0 hover:opacity-80 cursor-pointer transition-colors ${darkMode ? 'bg-[#1f1f23] text-zinc-400' : 'bg-white text-gray-400'}`}
        >
          {isDesktopSidebarOpen
            ? <ChevronLeftOutlined fontSize="small" className="scale-75" />
            : <ChevronRightOutlined fontSize="small" className="scale-75" />}
        </button>

        <div className="relative max-w-xs w-full sm:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search fontSize="small" />
          </div>
          <input
            type="text"
            placeholder={t('search')}
            className={`border-none rounded-xl py-2 pl-10 pr-4 w-full text-sm focus:ring-2 focus:ring-[#7c4dff] transition-all shadow-sm outline-none ${darkMode ? 'bg-[#1f1f23] text-zinc-200 placeholder-zinc-500' : 'bg-white text-gray-700 placeholder-gray-400'}`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 shrink-0">

        {/* Til tanlash */}
        <div className={`hidden md:block rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-[#1f1f23]' : 'bg-white'}`}>
          <FormControl size="small" variant="standard" sx={{ minWidth: 110, px: 1.5 }}>
            <Select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              displayEmpty
              disableUnderline
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                height: '36px',
                color: darkMode ? '#e4e4e7' : '#374151',
                '& .MuiSvgIcon-root': { color: darkMode ? '#a1a1aa' : '#6b7280' },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: darkMode ? '#1f1f23' : 'white',
                    color: darkMode ? '#e4e4e7' : '#374151',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    borderRadius: '10px',
                    mt: 0.5,
                  },
                },
              }}
            >
              <MenuItem value="uz"
                sx={{
                  fontSize: '13px', fontWeight: lang === 'uz' ? 600 : 400,
                  color: lang === 'uz' ? '#7c4dff' : (darkMode ? '#e4e4e7' : '#374151'),
                  '&:hover': { bgcolor: darkMode ? '#27272a' : '#f5f0ff' },
                }}>
                {t('langName')}
              </MenuItem>
              <MenuItem value="ru"
                sx={{
                  fontSize: '13px', fontWeight: lang === 'ru' ? 600 : 400,
                  color: lang === 'ru' ? '#7c4dff' : (darkMode ? '#e4e4e7' : '#374151'),
                  '&:hover': { bgcolor: darkMode ? '#27272a' : '#f5f0ff' },
                }}>
                Русский
              </MenuItem>
              <MenuItem value="en"
                sx={{
                  fontSize: '13px', fontWeight: lang === 'en' ? 600 : 400,
                  color: lang === 'en' ? '#7c4dff' : (darkMode ? '#e4e4e7' : '#374151'),
                  '&:hover': { bgcolor: darkMode ? '#27272a' : '#f5f0ff' },
                }}>
                English
              </MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Bildirishnomalar */}
        <button className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm transition-all ${darkMode ? 'bg-[#1f1f23] text-zinc-300 hover:bg-[#27272a]' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
          <NotificationsNone />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
          className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm transition-all ${darkMode ? 'bg-[#7c4dff] text-white hover:bg-[#6c3fe6]' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          {darkMode ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
        </button>

        {/* Profil */}
        <div className={`w-10 h-10 rounded-xl overflow-hidden shadow-sm border cursor-pointer ${darkMode ? 'border-[#27272a]' : 'border-white'}`}>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Chiqish */}
        <button
          onClick={handleLogout}
          className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm transition-all ${darkMode ? 'bg-[#1f1f23] text-red-400 hover:bg-red-900/30' : 'bg-white text-red-400 hover:bg-red-50 hover:text-red-500'}`}
          title={t('logout')}
        >
          <LogoutOutlined fontSize="small" />
        </button>
      </div>
    </header>
  );
};

export default Header;
