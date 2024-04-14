import Layout from "../components/Layout";
import InFolder from "../screens/InFolder";
import MenuProvider from "../screens/InFolder/MenuProvider";
import ModalProvider from "../screens/InFolder/ModalProvider";

export default function MyDrive() {
  return (
    <Layout>
      <MenuProvider>
        <ModalProvider>
          <InFolder path="My drive" />
        </ModalProvider>
      </MenuProvider>
    </Layout>
  );
}
