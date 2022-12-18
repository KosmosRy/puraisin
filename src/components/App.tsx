import { FC } from 'react';
import { appContainer, copyright } from './App.css';
import dayjs from 'dayjs';
import { FrontPage } from './FrontPage';
import { AppInfo, Binge } from '../types/common';

interface Props {
  appInfo: AppInfo;
  userStatus: Binge;
}

const App: FC<Props> = ({ appInfo, userStatus }) => (
  <div className={appContainer}>
    <FrontPage info={appInfo} initialUserStatus={userStatus} />
    <footer className={copyright}>&copy; Apin Heristäjät {dayjs().get('year')}</footer>
  </div>
);

export default App;
