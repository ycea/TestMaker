import TestsGridRenderer from "../layout/TestsGridRenderer";
const FavouriteTests = () => {
    return (
        <div className="text-center">
            <h2>Список избранных тестов</h2>
            <TestsGridRenderer
                endpointPrefix={"tests"}
                loadListEndPoint={"/api/my/favourite/tests"}
            ></TestsGridRenderer>
        </div>
    );
};
export default FavouriteTests;
