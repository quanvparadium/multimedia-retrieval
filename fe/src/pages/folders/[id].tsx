import Layout from "@/src/components/Layout";
import InFolder from "@/src/screens/InFolder";
import MenuProvider from "@/src/screens/InFolder/MenuProvider";
import ModalProvider from "@/src/screens/InFolder/ModalProvider";
import { useRouter } from "next/router";
import base64 from "base-64";
import { useEffect, useState } from "react";

export default function Folder() {
  const router = useRouter();
  const [folderId, setFolderId] = useState("");
  useEffect(() => {
    try {
      if (!router.query.id) return;
      const folderId: any = router.query.id;
      setFolderId(folderId);
    } catch (error) {
      router.push("/my-drive");
    }
  }, [router.query.id]);

  return (
    <Layout>
      <MenuProvider>
        <ModalProvider>
          <InFolder folderId={folderId} />
        </ModalProvider>
      </MenuProvider>
    </Layout>
  );
}
