import LayoutWithouNavBar from "../components/Layout/LayoutWithouNavBar";
import ModalProvider from "../Providers/ModalProvider";
import Info from "../screens/Info";

export default function InfoPage() {
    return (
        <LayoutWithouNavBar>
            <ModalProvider>
                <Info />
            </ModalProvider>
        </LayoutWithouNavBar>
    );
}
