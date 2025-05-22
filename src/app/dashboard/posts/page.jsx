import Posts from '@/Component/dashboard/Posts';
import NavBar from '@/Component/Navbar/navbar';
import Sidebar from '@/Component/Usersidebar/usersidebar';
const page = () => {
  return (
    <div>
      <NavBar/>
      <Sidebar/>

        <Posts/>
    </div>
  );
}

export default page;
