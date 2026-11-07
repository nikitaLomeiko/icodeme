"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { ProfilePage } from "@/pages-root/profile";

export default withAuth(withAccount(ProfilePage));
