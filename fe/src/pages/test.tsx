import MenuProvider from "../Providers/MenuProvider";
import ModalProvider from "../Providers/ModalProvider";
import TestPage from "../screens/Test/test";

export default function Test() {
    return (
        <MenuProvider>
            <ModalProvider>
                <TestPage />
            </ModalProvider>
        </MenuProvider>
    );
}
