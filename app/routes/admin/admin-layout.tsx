import { Outlet } from 'react-router'
import { MobileSideBar, NavItems } from 'components'
import { SidebarComponent } from '@syncfusion/ej2-react-navigations';


function AdminLayout() {
    return (
        <div className="admin-layout">
            <MobileSideBar />
            <aside className="w-full max-w-[270px] hidden lg:block">
                <SidebarComponent width={270} enableGestures={false} >
                    <NavItems />
                </SidebarComponent>
            </aside>
            <Outlet />
        </div>
    )
}

export default AdminLayout
