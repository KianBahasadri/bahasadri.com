import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import SMSMessenger from "./pages/tools/sms-messenger/sms-messenger";
import Calculator from "./pages/tools/calculator/calculator";
import HomeButton from "./components/HomeButton/HomeButton";

export default function App(): React.JSX.Element {
    return (
        <>
            <HomeButton />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sms-messenger" element={<SMSMessenger />} />
                <Route path="/calculator" element={<Calculator />} />
            </Routes>
        </>
    );
}
