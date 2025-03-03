import { useEffect } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import "./Layout.css";

const labelForRoute = (pathname: string): string => {
    return pathname.substring(1);
};

export const Layout = () => {
    const route = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if (route.pathname == '/') {
            navigate('/juanetoh');
        }
    }, [route, navigate]);
    const labelForCurrentRoute = labelForRoute(route.pathname);
    const reportIssueUrl = `https://github.com/jurelmetal/jurelmetal.github.io/issues/new?labels=${labelForCurrentRoute}`;
    return (
        <div className='container'>
            <Sidebar className="sidebar">
                <Menu>
                    <MenuItem component={<Link to="/juanetoh" />}>Home</MenuItem>
                    <MenuItem component={<Link to="/minesweeper" />}>Minesweeper</MenuItem>
                    <MenuItem href={reportIssueUrl}>Report issue</MenuItem>
                </Menu>
            </Sidebar>
            <div className='routeContent'>            
                <Outlet />
            </div>
        </div>
    );
};