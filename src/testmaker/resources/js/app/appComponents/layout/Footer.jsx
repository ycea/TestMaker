import { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../UserContext";
const Footer = () => {
    const { user } = useContext(UserContext);
    return (
        <footer className="d-flex justify-content-around text-sm-start  p-2 mt-auto">
            {user && (
                <Link className="text-decoration-none m-2" to="/feedback-form">
                    Обратная связь
                </Link>
            )}
            <a className="text-decoration-none m-2" href="https://t.me/ZvmC0R3">
                <i class="bi bi-telegram">Канал сайта</i>
            </a>
            <Link className="text-decoration-none m-2" to="/guide-for-site">
                О сайте
            </Link>
        </footer>
    );
};
export default Footer;
