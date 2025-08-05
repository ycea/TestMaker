import TestsGridRenderer from "./TestsGridRenderer";
const Main = () => {
    return (
        <main className="d-flex align-items-center flex-grow-1">
            <TestsGridRenderer
                endpointPrefix={"tests"}
                loadListEndPoint={"/api/tests"}
            ></TestsGridRenderer>
        </main>
    );
};
export default Main;
