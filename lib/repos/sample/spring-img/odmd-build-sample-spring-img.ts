import {OdmdEnverSampleSpringImg} from "./odmd-enver-sample-spring-img";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";
import {
    OdmdBuild,
    OdmdEnverCtnImg
} from "@ondemandenv/contracts-lib-base";

export class OdmdBuildSampleSpringImg extends OdmdBuild<OdmdEnverCtnImg> {
    private _envers: Array<OdmdEnverCtnImg>;
    get envers(): Array<OdmdEnverCtnImg> {
        return this._envers;
    }

    private _enverImg: OdmdEnverSampleSpringImg;
    get enverImg(): OdmdEnverSampleSpringImg {
        return this._enverImg;
    }

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'spring-rds-img', scope.githubRepos.sampleVpcRds);
    }

    protected initializeEnvers(): void {
        this._enverImg = new OdmdEnverSampleSpringImg(this);
        this._envers = [this._enverImg];
    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}
