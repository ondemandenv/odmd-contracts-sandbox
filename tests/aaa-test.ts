// Successfully instantiate OndemandContractsSandbox without errors
import {OndemandContractsSandbox} from "../lib/OndemandContractsSandbox";
import {App} from "aws-cdk-lib";


// Attempt to instantiate OndemandContractsSandbox when an instance already exists
it('should throw an error when trying to instantiate OndemandContractsSandbox if an instance already exists', () => {
    const app = new App();
    const fir = new OndemandContractsSandbox(app);
    fir.odmdValidate()
    expect(() => {
        new OndemandContractsSandbox(app);

    }).toThrow(`There is already a Construct with name 'OndemandContractsSandbox' in App`);
});