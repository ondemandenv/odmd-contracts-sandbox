import {Construct} from "constructs";
import {OdmdEnverSampleSpringImg} from "./odmd-enver-sample-spring-img";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";
import {ContractsBuild, ContractsEnverCtnImg} from "@ondemandenv/contracts-lib-base";

export class OdmdBuildSampleSpringImg extends ContractsBuild<ContractsEnverCtnImg> {

    ownerEmail?: string | undefined;

    readonly envers: Array<ContractsEnverCtnImg>

    readonly enverImg: OdmdEnverSampleSpringImg

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'spring-rds-img', scope.githubRepos.sampleVpcRds);
        this.enverImg = new OdmdEnverSampleSpringImg(this)
        this.envers = [
            this.enverImg
        ]
    }
    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}
