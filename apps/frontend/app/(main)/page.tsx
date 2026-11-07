"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { HomePage } from "@/pages-root/home";

const ProtectedHomePage = withAuth(withAccount(HomePage));

export default ProtectedHomePage;
