import { useEffect } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

import "./Layout.css";

export const Layout = () => {
    const route = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if (route.pathname == '/') {
            navigate('/juanetoh');
        }
    }, [route, navigate]);
    return (
        <div className='container'>
            <Sidebar className="sidebar">
                <Menu>
                    <MenuItem component={<Link to="/juanetoh" />}>Home</MenuItem>
                    <MenuItem component={<Link to="/minesweeper" />}>Minesweeper</MenuItem>
                </Menu>
            </Sidebar>
            <div className='routeContent'>            
                <Outlet />
            </div>
        </div>
    );
};