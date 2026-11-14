"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { HomePage } from "@/pages-root/home";

export default withAuth(withAccount(HomePage));
