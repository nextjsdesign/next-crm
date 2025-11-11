export { auth as middleware } from "next-auth";

export const config = {
  matcher: [
    "/",                 // dashboard
    "/devices/:path*",   // paginile cu dispozitive
    "/clients/:path*",   // clienți
    "/users/:path*",     // utilizatori
  ],
};