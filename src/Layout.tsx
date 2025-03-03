import { useCallback, useEffect, useState } from "react";
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
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapsed = useCallback(() => {
        setCollapsed(collapsed => !collapsed); 
    }, []);
    const reportIssueUrl = `https://github.com/jurelmetal/jurelmetal.github.io/issues/new?labels=${labelForCurrentRoute}`;
    return (
        <div className='container'>
            <Sidebar className="sidebar" collapsed={collapsed}>
                <Menu>
                    <MenuItem icon={'☰'} onClick={toggleCollapsed}></MenuItem>
                    <MenuItem icon={'🏠'} component={<Link to="/juanetoh" />}>Home</MenuItem>
                    <MenuItem icon={'💣'} component={<Link to="/minesweeper" />}>Minesweeper</MenuItem>
                    <MenuItem icon={'🐞'} href={reportIssueUrl}>Report issue</MenuItem>
                </Menu>
            </Sidebar>
            <div className='routeContent'>            
                <Outlet />
            </div>
        </div>
    );
};