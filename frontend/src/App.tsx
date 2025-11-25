import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import SMSMessenger from "./pages/tools/sms-messenger/sms-messenger";
import Calculator from "./pages/tools/calculator/calculator";
import VideoCallList from "./pages/video-call/VideoCallList";
import VideoCallRoom from "./pages/video-call/VideoCallRoom";
import NotFound from "./pages/NotFound/NotFound";
import HomeButton from "./components/HomeButton/HomeButton";

export default function App(): React.JSX.Element {
    return (
        <>
            <HomeButton />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sms-messenger" element={<SMSMessenger />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/video-call" element={<VideoCallList />} />
                <Route path="/video-call/:meetingId" element={<VideoCallRoom />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}
