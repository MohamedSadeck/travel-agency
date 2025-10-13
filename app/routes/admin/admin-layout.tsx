import { Outlet } from "react-router"

function AdminLayout() {
    return (
        <div className="admin-layout">
            <h1>Admin Dashboard</h1>
            <Outlet />
        </div>
    )
}

export default AdminLayout
