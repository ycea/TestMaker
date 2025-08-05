import TestsGridRenderer from "../layout/TestsGridRenderer";
const OwnedTests = () => {
    return (
        <div className="text-center">
            <h3>Список ваших тестов</h3>
            <TestsGridRenderer
                endpointPrefix={"my/tests"}
                loadListEndPoint="/api/my/tests"
            ></TestsGridRenderer>
        </div>
    );
};
export default OwnedTests;
