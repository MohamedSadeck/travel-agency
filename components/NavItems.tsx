import { cn } from 'lib/utils'
import React from 'react'
import { Link, NavLink, useLoaderData, useNavigate } from 'react-router'
import { logoutUser } from '~/appwrite/auth'
import { sidebarItems } from '~/constants'

function NavItems({ handleClick }: { handleClick?: () => void }) {
  const user = useLoaderData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/sign-in')
  }
  return (
    <section className='nav-items'>
      <Link to="/" className='link-logo'>
        <img src='/assets/icons/logo.svg' alt='logo' className='size-[30px]' />
        <h1>Tourvisto</h1>
      </Link>
      <div className='container'>
        <nav>
          {sidebarItems.map(({ id, icon, label, href }) => (
            <NavLink key={id} to={href} className='nav-link'>
              {({ isActive }: { isActive: boolean }) => (
                <div
                  className={cn('group nav-item', { 'bg-primary-100 !text-white': isActive })}
                  onClick={handleLogout}
                >
                  <img src={icon} alt={label} className={`group-hover:brightness-0 size-4 group-hover:invert ${isActive ? 'brightness-0 invert' : 'text-dark-200'}`} />
                  <label >{label}</label>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <footer className='nav-footer'>
          <img src={user?.imageUrl || '/assets/images/david.webp'} alt={user?.name || 'David'} className='size-8 rounded-full object-cover' />
          <article>
            <h2>{user?.name || 'David'}</h2>
            <p>{user?.email || 'david@example.com'}</p>
          </article>
          <button onClick={logoutUser} className='cursor-pointer'>
            <img src='/assets/icons/logout.svg' alt='logout' className='size-6' />
          </button>
        </footer>
      </div>

    </section>
  )
}

export default NavItems
