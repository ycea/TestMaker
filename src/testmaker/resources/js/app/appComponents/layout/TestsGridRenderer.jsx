import axios from "axios";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import useInfiniteScroll from "../Helpers/useInfiniteScroll";
const TestsGridRenderer = ({ endpointPrefix, loadListEndPoint }) => {
    const divLoader = useRef();
    const [finishedLoading, setFinish] = useState(false);
    const [tests, changeListTests] = useState([]);
    const currentPage = useRef(1);
    const loadTests = () => {
        axios
            .get(loadListEndPoint, { params: { page: currentPage.current } })
            .then((response) => {
                if (response.data.data.length == 0) {
                    setFinish(true);
                    return;
                }
                changeListTests((prev) => [...prev, ...response.data.data]);
                currentPage.current += 1;
            })
            .catch((error) => {
                console.error("ERROR TO LOAD DATA", error);
                alert("Не получилось загрузить тесты");
            });
    };
    useInfiniteScroll({
        targetRef: divLoader,
        onIntersect: loadTests,
        isFinished: finishedLoading,
    });
    if (!tests) {
        return <div>Идет загрузка тестов</div>;
    }
    return (
        <div className="d-flex align-items-center container ">
            {tests.length == 0 && <div>Тестов пока нет, увы </div>}

            <div className="row  my-5 mx-1 justify-content-center row-cols-1 row-cols-md-3 row-cols-lg-5 gap-5 ">
                <div className="sticky-top col text-center">
                    <button
                        className="btn btn-success m-2"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                    >
                        Наверх
                    </button>
                </div>
                {tests.map((test) => {
                    return (
                        <div className="col border border-dark h-100 ">
                            <Link
                                className="text-decoration-none"
                                to={`/${endpointPrefix}/${test.test_data.id}`}
                            >
                                <img
                                    src={`${test.test_data.image_href}`}
                                    className="img-fluid mx-auto"
                                    alt="Обложка теста"
                                />
                                <p className="">{test.test_data.name}</p>
                            </Link>
                        </div>
                    );
                })}
            </div>

            <div ref={divLoader} style={{ height: "10px" }}></div>
        </div>
    );
};
export default TestsGridRenderer;
