import { useRef, useState, useCallback } from 'react';
import Search from '/src/pages/Search';
import {
  Maximize2,
  SquareArrowOutUpRight,
  ZoomIn,
  ZoomOut,
  Cloud,
  HardDrive,
  Bug,  Code,
  Home as HomeIcon,} from 'lucide-react';
import { useLocalGmLoader } from '/src/utils/hooks/player/useLocalGmLoader';
import { useNavigate } from 'react-router-dom';
import Control from './Controls';
import InfoCard from './InfoCard';
import theming from '/src/styles/theming.module.css';
import clsx from 'clsx';
import Tooltip from '@mui/material/Tooltip';
import loaderStore from '/src/utils/hooks/loader/useLoaderStore';

const Loader = ({ theme, app }) => {
  const nav = useNavigate();
  const gmRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [showDev, setShowDev] = useState(false);
  const { gmUrl, loading, downloading } = useLocalGmLoader(app);
  const isLocal = app?.local;
  const activeFrameRef = loaderStore((state) => state.activeFrameRef);

  const fs = useCallback(() => {
    if (gmRef.current) {
      gmRef.current?.requestFullscreen?.();
    } else if (activeFrameRef?.current) {
      //browser restricts fullscreen w/o some sort of user interaction
      //using boolean to decide fs wont work so we directly use frame reference
      activeFrameRef.current?.requestFullscreen?.();
    }
  }, [activeFrameRef]);

  const external = useCallback(() => {
    nav('/search', {
      state: {
        url: app?.url,
      },
    });
  }, [app?.url]);

  const handleZoom = useCallback((direction) => {
    setZoom((prev) => {
      const newZoom = direction === 'in' ? Math.min(prev + 0.1, 2) : Math.max(prev - 0.1, 0.5);
      if (gmRef.current) gmRef.current.style.zoom = newZoom;
      return newZoom;
    });
  }, []);

  return (
    <div
      className={clsx(
        'flex flex-col h-[calc(100vh-38px)] w-full rounded-xl',
        theming.appItemColor,
        theming[`theme-${theme || 'default'}`],
      )}
    >
      <div className="p-2 pl-1 border-b flex gap-2 items-center">
        <InfoCard app={app} theme={theme} />
        <Tooltip
          title={isLocal ? 'Downloaded to device (local)' : 'Fetched from web'}
          arrow
          placement="top"
        >
          <div className="flex items-center ml-auto mr-5">
            {isLocal ? (
              <HardDrive size={18} className="opacity-80" />
            ) : (
              <Cloud size={18} className="opacity-80" />
            )}
          </div>
        </Tooltip>
      </div>

      {loading ? (
        <div className="w-full flex-grow flex items-center justify-center">
          {downloading ? 'Downloading...' : 'Loading...'}
        </div>
      ) : isLocal ? (
        <iframe
          key={gmUrl}
          src={gmUrl}
          ref={gmRef}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full flex-grow"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock"
        />
      ) : (
        <Search config={{ url: app?.url, ui: false, zoom: zoom, alerts: false }} />
      )}

      <div className="p-2.5 flex gap-2 border-t relative">
        {isLocal ? (
          <Tooltip title="Local games can't open in browser" arrow placement="top">
            <div className="cursor-not-allowed">
              <Control
                icon={SquareArrowOutUpRight}
                fn={null}
                className="cursor-not-allowed opacity-50 pointer-events-none"
              />
            </div>
          </Tooltip>
        ) : (
          <Control icon={SquareArrowOutUpRight} fn={external} />
        )}

        <Control icon={HomeIcon} fn={() => nav('/')} title="Home" />
        <Control
          icon={Bug}
          fn={() =>
            window.open('https://forms.gle/JnvtauV7vX5trxAy8', '_blank', 'noopener noreferrer')
          }
          className="ml-auto"
        >
          Report Issue
        </Control>
        <Control icon={Code} fn={() => setShowDev((v) => !v)} title="Dev Tools" />
        <Control icon={ZoomIn} fn={() => handleZoom('in')} />
        <Control icon={ZoomOut} fn={() => handleZoom('out')} />
        <Control icon={Maximize2} fn={fs} />
        {showDev && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col">
            <div className="flex justify-between items-center p-2 text-white">
              <span>Dev Tools (press F12)</span>
              <button
                className="px-2 py-1 bg-gray-700 rounded"
                onClick={() => setShowDev(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-grow p-4 text-white overflow-auto">
              <p>Use your browser's developer tools to inspect the iframe content.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
