// src/layouts/UserLayout.jsx
import { Outlet } from 'react-router-dom';
import UserNavbar from './UserNavbar';

const UserLayout = () => (
  <div>
    <UserNavbar />
    {/* <Outlet /> */}
  </div>
);

export default UserLayout;
