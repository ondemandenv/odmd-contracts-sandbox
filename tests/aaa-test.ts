// Successfully instantiate OndemandContractsSandbox without errors
import {OndemandContractsSandbox} from "../lib/OndemandContractsSandbox";
import {App} from "aws-cdk-lib";


// Attempt to instantiate OndemandContractsSandbox when an instance already exists
it('should instantiate OndemandContractsSandbox without errors', () => {
    const app = new App();
    const fir = new OndemandContractsSandbox(app);
    fir.odmdValidate()
    expect(fir.odmdBuilds.length).toBeGreaterThan(0);
});