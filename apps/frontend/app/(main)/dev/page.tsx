"use client";

import { withAuth, withAccount } from "@/app/providers/auth";
import { DevPage } from "@/pages-root/dev";

export default withAuth(withAccount(DevPage));
