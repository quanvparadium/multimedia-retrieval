import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import InFolder from "../screens/InFolder";
import MenuProvider from "../screens/InFolder/MenuProvider";
import ModalProvider from "../screens/InFolder/ModalProvider";
import { fileSystemApi } from "../apis/file-system/file-system.api";

export default function MyDrive() {

  const [folderId, setFolderId] = useState();
  useEffect(() => {
    const getFolderId = async () => {
      try {
        const res: any = await fileSystemApi.getMyDrive();
        setFolderId(res.data);
      } catch (error) {
      }
    };
    getFolderId();
  }, []);
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
