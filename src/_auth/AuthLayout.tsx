import { useUserContext } from "@/context/AuthContext";
import { Outlet, Navigate } from "react-router-dom";

/**
 * This is the AuthLayout component.
 * It is used to render the authentication layout.
 * It renders the Outlet component to render the child routes.
 * It also renders the Navigate component to redirect to the home page if the user is authenticated.
 */

const AuthLayout = () => {

  const { isAuthenticated } = useUserContext();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>

          <img
            src="/assets/images/side-img.svg"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;

