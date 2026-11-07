"use client";

import { withAccount, withAuth } from "@/app/providers/auth";
import { MapPage } from "@/pages-root/map/map.page";

const ProtectedMapPage = withAuth(withAccount(MapPage));

export default ProtectedMapPage;
