import { Outlet } from 'react-router-dom';
import CompanyNavbar from './CompanyNavbar';

const CompanyLayout = () => (
  <div>
    <CompanyNavbar />
    <Outlet />
  </div>
);

export default CompanyLayout;