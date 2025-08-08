import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../UserContext";
export const Header = () => {
    const { user } = useContext(UserContext);
    const calculateTimeLeft = () => {
        const now = new Date();
        const difference = new Date(2025, 8, 5, 20) - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        const totalSeconds = Math.floor(difference / 1000);

        return {
            days: Math.floor(totalSeconds / (60 * 60 * 24)),
            hours: Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60)),
            minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
            seconds: totalSeconds % 60,
        };
    };
    console.log(1);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return (
        <header className="d-flex flex-row justify-content-between align-items-center py-3">
            <div className="d-flex flex-column mx-3">
                <ul className="list-unstyled ">
                    <li>Дни: {timeLeft.days}</li>
                    <li>Часы: {timeLeft.hours}</li>
                    <li>Секунды: {timeLeft.seconds}</li>
                </ul>
            </div>
            <div className="d-flex flex-column container text-center ">
                <h1 className="mb-1">TestLib</h1>
                <h3 className="text-muted d-none d-sm-block fs-5">
                    Создавайте, делитесь, комментируйте
                </h3>
            </div>

            <nav className="navbar navbar-expand-lg navbar-light me-1 fw-bold">
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item ">
                            <Link to="/" className="nav-link">
                                <i class="bi bi-house-door-fill">На главную</i>
                            </Link>
                        </li>
                        {/* Here checks if user is authenticated. If so he can proceed to his profile if not offers to register*/}
                        {user ? (
                            <>
                                <li className="nav-item ">
                                    <Link to="/profile" className="nav-link">
                                        Профиль
                                    </Link>
                                </li>
                                <li className="nav-item ">
                                    <Link to="/make-test" className="nav-link">
                                        Создать тест
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item ">
                                <Link
                                    to="/register"
                                    className="nav-link fs-6 me-1"
                                >
                                    Зарегистрироваться
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};
export default Header;
