import Layout from "@/src/components/Layout";
import MenuProvider from "@/src/Providers/MenuProvider";
import ModalProvider from "@/src/Providers/ModalProvider";
import StorageScreen from "../screens/Storage";

export default function Trash() {
    return (
        <Layout>
            <MenuProvider>
                <ModalProvider>
                    <StorageScreen />
                </ModalProvider>
            </MenuProvider>
        </Layout>
    );
}
