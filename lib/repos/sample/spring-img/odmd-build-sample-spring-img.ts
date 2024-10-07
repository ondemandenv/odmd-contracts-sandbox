import {OdmdEnverSampleSpringImg} from "./odmd-enver-sample-spring-img";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";
import {OdmdBuild, OdmdEnverCMDs, OdmdEnverCtnImg} from "@ondemandenv/contracts-lib-base";

export class OdmdBuildSampleSpringImg extends OdmdBuild<OdmdEnverCMDs> {

    ownerEmail?: string | undefined;

    readonly envers: Array<OdmdEnverCtnImg>

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
