import Layout from "@/src/components/Layout";
import InFolder from "@/src/screens/InFolder";
import MenuProvider from "@/src/screens/InFolder/MenuProvider";
import ModalProvider from "@/src/screens/InFolder/ModalProvider";
import { useRouter } from "next/router";
import base64 from "base-64";
import { useEffect, useState } from "react";

export default function Folder() {
  const router = useRouter();
  const [path, setPath] = useState("");
  useEffect(() => {
    try {
      if (!router.query.path) return;
      const encodedPath: any = router.query.path;
      setPath(base64.decode(encodedPath));
    } catch (error) {
      router.push("/my-drive");
    }
  }, [router.query.path]);

  return (
    <Layout>
      {path && (
        <MenuProvider>
          <ModalProvider>
            <InFolder path={`My Drive/${path}`} />
          </ModalProvider>
        </MenuProvider>
      )}
    </Layout>
  );
}
