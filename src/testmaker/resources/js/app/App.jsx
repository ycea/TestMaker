import axios from "axios";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./appComponents/About";
import AdminPanel from "./appComponents/adminComponents/AdminPanel";
import ModeratedTests from "./appComponents/adminComponents/ModeratedTests";
import FeedbackForm from "./appComponents/FeedbackForm";
import Footer from "./appComponents/layout/Footer";
import Header from "./appComponents/layout/Header";
import Main from "./appComponents/layout/Main";
import Question from "./appComponents/testConstructor/Question";
import TestEditor from "./appComponents/testConstructor/TestEditor";
import TestMaker from "./appComponents/testConstructor/TestMaker";
import TestEvaluator from "./appComponents/testPassing/TestEvaluator";
import FavouriteTests from "./appComponents/userProfile/FavouriteTests";
import OwnedTests from "./appComponents/userProfile/OwnedTests";
import UserProfile from "./appComponents/userProfile/UserProfile";
import LoginForm from "./appComponents/userRegister/LoginForm";
import RegisterForm from "./appComponents/userRegister/RegisterForm";
import RouteProtector from "./ProtectedRoute";
import UserContext from "./UserContext";
import UUIDValidator from "./UUIDValidator";

export default function App() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        axios.get("/sanctum/csrf-cookie", { withCredentials: true });

        axios
            .get("/api/user", {
                headers: { Accept: "application/json" },
                withCredentials: true,
            })
            .then((response) => {
                setUser(response.data);
            })
            .catch(() => {
                setUser(false);
            });
    }, []);

    return (
        <BrowserRouter>
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <UserContext.Provider value={{ user, setUser }}>
                    <Header></Header>
                    <Routes>
                        <Route path="/" element={<Main />}></Route>
                        <Route
                            path="/register"
                            element={<RegisterForm />}
                        ></Route>
                        <Route path="/login" element={<LoginForm />}></Route>
                        <Route path="/guide-for-site" element={<About />} />
                        <Route element={<UUIDValidator />}>
                            <Route
                                path="/tests/:id"
                                element={<TestEvaluator />}
                            />
                        </Route>
                        <Route element={<RouteProtector user={user} />}>
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/make-test" element={<TestMaker />} />
                            <Route
                                path="/profile/my/tests"
                                element={<OwnedTests />}
                            />
                            <Route
                                path="/profile/my/favourite/tests"
                                element={<FavouriteTests />}
                            />
                            <Route
                                path="/moderated/tests"
                                element={<ModeratedTests />}
                            />
                            <Route
                                path="/control/users"
                                element={<AdminPanel />}
                            />
                            <Route
                                path="/feedback-form"
                                element={<FeedbackForm />}
                            />
                            <Route element={<UUIDValidator />}>
                                <Route
                                    path="/question/:id"
                                    element={<Question />}
                                />
                                <Route
                                    path="/my/tests/:id"
                                    element={<TestEditor />}
                                />
                            </Route>
                        </Route>

                        <Route path="*" element={<Main />}></Route>
                    </Routes>
                    <Footer></Footer>
                </UserContext.Provider>
            </div>
        </BrowserRouter>
    );
}
