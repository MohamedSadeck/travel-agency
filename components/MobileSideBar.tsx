import { SidebarComponent } from '@syncfusion/ej2-react-navigations'
import { Link } from 'react-router'
import NavItems from './NavItems';

function MobileSideBar() {
    let sidebar: SidebarComponent;

    const toggleSidebar = () => {
        sidebar.toggle();
    }

    return (
        <div className='mobile-sidebar wrapper'>
            <header>
                <Link to="/" className='link-logo'>
                    <img src='/assets/icons/logo.svg' alt='logo' className='size-[30px]' />
                    <h1>Tourvisto</h1>
                </Link>
                <button onClick={toggleSidebar}>
                    <img src='/assets/icons/menu.svg' alt='menu' className='size-7 cursor-pointer' />
                </button>
            </header>
            <SidebarComponent
                // @ts-ignore
                width={270}
                // @ts-ignore | make the current sidebar as the used one 
                ref={(Sidebar) => sidebar = Sidebar}
                // make the sidebar hidden as default
                created={() => sidebar.hide()}
                // close the sidebar when clicking outside of it
                closeOnDocumentClick={true}
                // apply overlay effect
                showBackdrop={true}
                type='over'
            >
                <NavItems handleClick={toggleSidebar} />

            </SidebarComponent>
        </div>
    )
}

export default MobileSideBar
