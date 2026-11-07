"use client";

import { withAuth } from "@/app/providers/auth";
import { AuthProfilePage } from "@/pages-root/auth";

export default withAuth(AuthProfilePage);
