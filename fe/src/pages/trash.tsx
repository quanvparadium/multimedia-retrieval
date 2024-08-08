import Layout from "@/src/components/Layout";
import InFolder from "@/src/screens/InFolder";
import MenuProvider from "@/src/Providers/MenuProvider";
import ModalProvider from "@/src/Providers/ModalProvider";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TrashScreen from "../screens/Trash";

export default function Trash() {


    return (
        <Layout>
            <MenuProvider>
                <ModalProvider>
                    <TrashScreen />
                </ModalProvider>
            </MenuProvider>
        </Layout>
    );
}
