import { animate, style, transition, trigger } from "@angular/animations";
import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Input,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ElementDividerComponent } from "../components/element-divider/element-divider.component";
import { SiteScreenComponent } from "../components/site-screen/site-screen.component";
import * as POBLJSON from "../ProofJSONs/POBL.json";
import * as POGJSON from "../ProofJSONs/POG.json";
import * as POEJSON from "../ProofJSONs/POE.json";
import * as POELangJSON from "../ProofJSONs/POE_lang.json";
import * as POGLangJSON from "../ProofJSONs/POG_lang.json";
import * as ActionConfigurations from "../ProofJSONs/ActionConfigurations.json";

@Component({
  selector: "proof-bot",
  templateUrl: "./proof-bot.component.html",
  styleUrls: ["./proof-bot.component.css"],
  animations: [
    trigger("screenAnimation", [
      transition(":enter", [
        style({ transform: "translateY(400px)", opacity: 0 }),
        animate("400ms", style({ transform: "translateY(0%)", opacity: 1 }))
      ])
    ]),
    trigger("screenAnimationDemo", [
      transition(":enter", [
        style({ transform: "translateY(400px)", opacity: 0 }),
        animate("1200ms", style({ transform: "translateY(0%)", opacity: 1 }))
      ])
    ]),
    trigger("inOutAnimation", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("100ms ease-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate("100ms ease-in", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ProofBotComponent implements OnInit {
  StorageTitle: string = "Storage Container";
  ProofContainerTitle: string = "Proof Container";
  @Input() initialWidth: string = "100%";
  @Input() initialHeight: string = "100%";
  @Input() minWidth: string = "82%";
  @Input() minHeight: string = "82%";
  @Input() maxWidth: string = "100%";
  @Input() maxHeight: string = "100%";
  @Input() justifyContent: string = "center";
  @Input() alignItems: string = "center";
  currentStep: number = 0;
  lastCompletedStep: number = 0;
  totalSteps: number = 0;
  gsHeightExpand: boolean = false;
  @Input() vsHeightExpand: boolean = false;
  @Input() isEmbedded: boolean = false;
  @Input() isAutoScale: boolean = true;
  isStartDemo: boolean = false;
  isPause: boolean = false;
  isReplay: boolean = false;
  isLoading: boolean = false;
  isPlayCompleted: boolean = false;
  variableStorage: any = {};
  proofJSON: any = {};
  globalData: object[] = [];
  steppers: any[] = [];
  subSteppers: any[] = [];
  demoScreenChildRefs: any = {};
  color = "primary";
  mode = "indeterminate";
  value = 10;
  gsOverflowX: string = "hidden";
  vsOverflowX: string = "hidden";
  ActionDescription: string = "";
  TXNhash: string = "";
  TXNhash2: string = "";
  playbackSpeed: number = 1;
  @Input() proofBotParams: any;
  isDisableGlobalInformationL: boolean = true;
  isDisableGlobalInformationR: boolean = true;
  isBackToStep: boolean = false;
  isToast: boolean = false;
  @Input() isTheater: boolean = false;
  toastMSG: string;
  toastTop: string = "40%";
  toastLeft: string = "32%";
  ActionConfigurations: any;
  SegmentNumber: number;
  availableProofs: any[] = ["poe"];
  proofType: string = "";
  lang: string = "en";
  Name: string =""
  @ViewChild("ProofDemoDirective", { read: ViewContainerRef, static: false })
  proofDemoRef: ViewContainerRef;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!this.isEmbedded) {
      this.route.queryParamMap.subscribe(params => {
        this.proofBotParams = {
          params:{
          txn: params.get('txn'),
          type: params.get('type')
          }
        }
      });
    }
    this.proofType = this.proofBotParams.params.type;
  }

  async ngAfterViewInit() {
    // this.scrollToFrameById('proofContainer');
    this.cdr.detectChanges();
  }

  async startDemoFn() {
    if (
      this.proofBotParams &&
      this.proofBotParams.params &&
      this.availableProofs.includes(this.proofBotParams.params.type)
    ) {
      this.TXNhash = this.proofBotParams.params.txn;
      this.TXNhash2 = this.proofBotParams.params.txn2;
      this.variableStorage['TXNhash'] = this.proofBotParams.params.txn //'be22a568072abfc106f2f1e37809befb4c260d7ebe21f89ba8e2e7dcda27e8e7'
      this.isLoading = true;

      // backend call
      await new Promise(resolveTime => setTimeout(resolveTime, 4200));

      // start demo (not -verifing)
      this.initiateProofDemo();
    } else
      alert('Proof verification is not yet available for the selected type.');
  }

  async initiateProofDemo() {
    const { protocolJson, langJson } = this.getProtocolJSON();
    this.proofJSON = protocolJson;
    // handle lang
    if (langJson) this.handleLangJson(langJson);

    this.ActionConfigurations = this.getActionConfigurations();

    // handleMultiStepAction
    this.handleMultiStepActions();

    //console.log('langJson', langJson);
    // if verification success
    //console.log(this.proofJSON);

    const { Header } = this.proofJSON;
    this.StorageTitle = Header.StorageTitle;
    this.ProofContainerTitle = Header.ProofContainerTitle;
    this.steppers = this.filterSegmentsAndActions(Header.Segments);
    
    //console.log('Steppers',this.steppers);
    this.playbackSpeed = Header.PlaybackSpeed;
    this.gsHeightExpand = Header.GSHeightExpand;
    this.gsOverflowX = Header.GSOverflowX;
    if (Object.keys(Header).includes('VSHeightExpand'))
      this.vsHeightExpand = Header.VSHeightExpand;
    this.vsOverflowX = Header.VSOverflowX;

    //console.log(this.steppers);

    await this.scrollToFrameById('proofHeaderTitle', 20);
    this.isStartDemo = true;
    this.playProofDemo(0);
  }

  getProtocolJSON() {
    var protocolJson: any;
    var langJson: any;
    switch (this.proofType) {
      case "pobl":
        protocolJson = POBLJSON;
        break;
      case "pog":
        protocolJson = POGJSON;
        langJson = POGLangJSON;
        break;
      case "poe":
        protocolJson = POEJSON;
        langJson = POELangJSON;
        break;
      default:
        break;
    }
    return { protocolJson: protocolJson.default, langJson: langJson.default };
  }

  handleLangJson(langJson: any) {
    let { Segments, Actions } = langJson;
    //console.log('Sementics', Segments)
    var variables = Segments;

    for (let index = 0; index < Actions.length; index++) {
      const action = Actions[index];
     // console.log("Action : ",Actions[index]);
      variables = {
        ...variables,
        ...action.Languages
      };
    }

    this.proofJSON = this.parseLangData(this.proofJSON, variables);
    //console.log(' this.proofJSONss', this.parseLangData(this.proofJSON, variables));
    //console.log( this.proofJSON )
  }

  parseLangData(action: any, storedData: any = this.variableStorage): any {
    var data = JSON.stringify(action).toString();
    [...data.matchAll(/"\&{[^}]+}"|\&{[^}]+}/g)].forEach(a => {
      try {
        let key = a[0].match(/\&{([^}]+)}/g)[0].slice(2, -1);
       // console.log('key', key);
       // console.log('storedData',storedData);

        if (key && storedData) {
          var replaceValue = storedData[key];
          var valueType = typeof replaceValue;
          
          if (valueType == "string" && a[0].match(/"\&{[^}]+}"/g)) {
            try {
              var result = JSON.stringify(replaceValue);
              replaceValue = result;
            } catch (error) {
              replaceValue = `"${replaceValue}"`;
            }
          } else if (valueType == "object")
            replaceValue = JSON.stringify(replaceValue);

          data = data.replace(a[0], replaceValue);
         // console.log('replaceValue:', replaceValue);
         // console.log('valueType:',valueType);
          //console.log('data:',data);
        }
      } catch (error) {}
    });
    //console.log('parseLangDataJSon: under me');
    //console.log('parseLangDataJSon:', JSON.parse(data));
    return JSON.parse(data);
  }

  getActionConfigurations() {
    var actionConfigs: any = ActionConfigurations;
    //console.log('ActionConfigs',actionConfigs);
    return actionConfigs.default;
  }

  handleMultiStepActions() {
    var proofJSONSteps: any = [];
    var { Steps } = this.proofJSON;
    for (let index = 0; index < Steps.length; index++) {
      const step = Steps[index];
      //console.log("step",step["Action"]);

      //console.log(typeof step);

      if (step["Action"].ActionType == "MultiStepAction") {
        var subActions = this.ActionConfigurations[
          step["Action"].ActionParameters.ActionConfigurationID
        ].Actions;
        for (let j = 0; j < subActions.length; j++) {
          const subAction = subActions[j];
          const formattedAction = this.parseSubActionData(
            subAction,
            step["Action"].ActionParameters.SubActionArguments
          );
          formattedAction.Action._ID = proofJSONSteps.length;
          proofJSONSteps.push(formattedAction);
        }
      } else {
        step["Action"]._ID = proofJSONSteps.length;
        proofJSONSteps.push(step);
      }
    }
    this.proofJSON.Steps = proofJSONSteps;
  }

  parseSubActionData(action: any, storedData: any = this.variableStorage): any {
    let data = JSON.stringify(action).toString();
   // console.log("JSON.stringify(action).toString()",JSON.stringify(action).toString());
    [...data.matchAll(/"\#{[^}]+}"|\#{[^}]+}/g)].forEach(a => {
      //console.log("a--",a);
      try {
        let key = a[0].match(/\#{([^}]+)}/g)[0].slice(2, -1);
        if (key && storedData) {
          var replaceValue = storedData[key];
          var valueType = typeof replaceValue;
          if (valueType == "string" && a[0].match(/"\#{[^}]+}"/g)) {
            try {
              var result = JSON.stringify(replaceValue);
              //console.log("result-------",result);
              replaceValue = result;
            } catch (error) {
              replaceValue = `"${replaceValue}"`;
            }
          } else if (valueType == "object")
            replaceValue = JSON.stringify(replaceValue);
              //console.log("replaceValue------------------",replaceValue);
          data = data.replace(a[0], replaceValue);
         // console.log("data.replace(a[0], replaceValue);---",data.replace(a[0], replaceValue));
        }
      } catch (error) {}
    });
    //console.log('Data----',data);
    //console.log('parseSubActionDataParseSubActionData', JSON.parse(data));
    return JSON.parse(data);
  }

  filterSegmentsAndActions(Segments: any) {
    return Segments.map((Segment: any) => {
      const SubActions = this.proofJSON.Steps.reduce(
        (subActions: Array<any>, job: any) => {
          const {
            StepHeader: { SegmentNo },
            Action: { _ID, ActionTitle}
          } = job;
          if (SegmentNo == Segment.NO) {
              subActions.push({
                ActionID: _ID,
                ActionName: ActionTitle
                
              });
               
          }
          return subActions;
        },
        []
      );
      return {
        ...Segment,
        SubActions
      };
    });
  }

  async scrollToFrameById(frameID: string, offset = 0) {
    const bodyRect: any = document.body.getBoundingClientRect();
    const el: any = document.getElementById(frameID);
    if (!el) return;
    const pcRect = el.getBoundingClientRect();
    const pcWidth = pcRect.x - bodyRect.x;
    const pcHeight = pcRect.y - bodyRect.y;
    window.scroll({
      top: pcHeight - offset,
      left: pcWidth,
      behavior: "smooth"
    });
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
  }

  // player controlls

  setLangFn(lang: string) {
    this.lang = lang;
    //console.log("language",this.lang);
  }
  
  togglePlayPauseFn() {
    if (this.isPause) {
      this.isPause = false;
      if (this.isPlayCompleted) this.currentStep = 0;
      this.playProofDemo();
    } else {
      this.isPause = true;
    }
  }

  replayFn() {
    this.StorageTitle = "Storage";
    this.ProofContainerTitle = "Proof Container";
    this.currentStep = 0;
    // this.lastCompletedStep= 0;
    this.totalSteps = 0;
    this.gsHeightExpand = false;
    this.vsHeightExpand = false;
    // this.isStartDemo = false;
    this.isPause = false;
    this.isReplay = true;
    this.isLoading = false;
    this.isPlayCompleted = false;
    // this.variableStorage= {};
    // this.proofJSON = {};
    this.globalData = [];
    this.steppers = [];
    this.demoScreenChildRefs = {};
    this.ActionConfigurations = {};
    // this.color = "primary";
    // this.mode = "indeterminate";
    // this.value = 10;
    // this.gsOverflowX= "hidden";
    // this.vsOverflowX= "hidden";
    this.ActionDescription = "";
    // this.TXNhash= "";
    this.playbackSpeed = 1;
    // this.proofBotParams = {};
    this.isDisableGlobalInformationL = true;
    this.isDisableGlobalInformationR = true;
    this.isBackToStep = false;

    this.proofDemoRef.clear();
    this.cdr.detectChanges();
    this.initiateProofDemo();
  }

  stopFn() {
    this.StorageTitle = "Storage";
    this.ProofContainerTitle = "Proof Container";
    this.currentStep = 0;
    this.lastCompletedStep = 0;
    this.totalSteps = 0;
    this.gsHeightExpand = false;
    this.vsHeightExpand = false;
    this.isStartDemo = false;
    this.isPause = false;
    this.isReplay = false;
    this.isLoading = false;
    this.isPlayCompleted = false;
    this.variableStorage = {};
    this.proofJSON = {};
    this.globalData = [];
    this.steppers = [];
    this.demoScreenChildRefs = {};
    // this.color = "primary";
    // this.mode = "indeterminate";
    // this.value = 10;
    // this.gsOverflowX= "hidden";
    // this.vsOverflowX= "hidden";
    this.ActionDescription = "";
    // this.TXNhash= "";
    this.playbackSpeed = 1;
    // this.proofBotParams = {};
    this.isDisableGlobalInformationL = true;
    this.isDisableGlobalInformationR = true;
    this.isBackToStep = false;
  }

  setSpeed(speed: number) {
    if (!speed || isNaN(speed) || speed == 0)
      alert("Please enter a valid playback speed.");
    else this.playbackSpeed = speed;
  }

  theaterMode() {
    window.open(
      `/proof-verification?type=${this.proofType}&txn=${this.TXNhash}${
        this.TXNhash2 ? `&txn2=${this.TXNhash2}` : ""
      }`
    );
  }

  async resizeGlobalScreen() {
    this.gsHeightExpand = !this.gsHeightExpand;
    await new Promise(resolveTime => setTimeout(resolveTime, 800));
    this.scrollToFrameById("globalInformation", 10);
  }

  async resizeVerifyScreen() {
    this.vsHeightExpand = !this.vsHeightExpand;
    await new Promise(resolveTime => setTimeout(resolveTime, 800));
    this.scrollToFrameById("verificationScreen", 10);
  }

  backToAction(actionID: number) {
    var i: number = this.proofJSON.Steps.findIndex(
      (cur: any) => cur.Action._ID == actionID
    );
    // console.log(this.isPlayCompleted, this.lastCompletedStep, i, this.lastCompletedStep >= i);
    if (this.lastCompletedStep >= i) {
      this.isBackToStep = true;
      this.currentStep = i;
      if (this.isPause) {
        this.isPause = false;
        this.playProofDemo();
      }
    }
    if (this.isPlayCompleted) this.playProofDemo();
  }

  backToStep(stepNo: number) {
    var i: number = this.proofJSON.Steps.findIndex(
      (cur: any) => cur.StepHeader.SegmentNo == stepNo
    );
    // console.log(this.isPlayCompleted, this.lastCompletedStep, i, this.lastCompletedStep >= i);
    if (this.lastCompletedStep >= i) {
      this.isBackToStep = true;
      this.currentStep = i;
      if (this.isPause) {
        this.isPause = false;
        this.playProofDemo();
      }
    }
    if (this.isPlayCompleted) this.playProofDemo();
  }

  // controllers for steppers
  async toStepper(no: number, _ID: number) {
    this.SegmentNumber = no;
    document
      .querySelectorAll("#steppersFrame")[0]
      .classList.add("steppersShow");
    const steppersFrame = document.querySelectorAll(
      "#steppersFrame #segments #stepWrapper"
    )[0];
    const allSteps = document.querySelectorAll(
      "#segments .bs-stepper-header.cs-stepper-header .step"
    );
    var allSegmentLines = document.querySelectorAll(
      "#segments .bs-stepper-header.cs-stepper-header .line"
    );
    const el: any = allSteps[no - 1];
    // allSteps[no - 1].scrollIntoView();
    steppersFrame.scroll({
      top:
        el.offsetTop -
        steppersFrame.getBoundingClientRect().height +
        el.getBoundingClientRect().height,
      left:
        el.offsetLeft -
        steppersFrame.getBoundingClientRect().width +
        el.getBoundingClientRect().width,
      behavior: "smooth"
    });
    el.classList.add("glow");
    for (let i = 0; i < no - 1; i++) {
      allSteps[i].classList.remove("glow");
      allSteps[i].classList.add("success");
      allSegmentLines[i].classList.add("bg-success");
    }
    for (let j = no; j < allSteps.length; j++) {
      allSteps[j].classList.remove("glow");
      allSteps[j].classList.remove("success");
      allSegmentLines[j].classList.remove("bg-success");
    }
    await this.toSubStepper(no, _ID);
    await new Promise(resolveTime =>
      setTimeout(resolveTime, 1000 / this.playbackSpeed)
    );
  }

  async toSubStepper(segmentNo: number, actionID: number) {
    this.subSteppers = this.steppers.find(
      (step: any) => step.NO == segmentNo
    ).SubActions;
    //console.log("substeppers",this.subSteppers);
    await new Promise(resolveTime => setTimeout(resolveTime, 1000));
    var index = this.subSteppers.findIndex(
      (step: any) => step.ActionID == actionID
    );
    /*this.ActionDescription =
      this.ActionDescription +
      ` (Segment NO: ${segmentNo}, Action ID: ${segmentNo}.${actionID + 1})`;
      console.log("actionDescription",this.ActionDescription);*/
    var allSubSteps = document.querySelectorAll(
      "#subSteppers .bs-stepper-header.cs-stepper-header .step"
    );
    var allSubLines = document.querySelectorAll(
      "#subSteppers .bs-stepper-header.cs-stepper-header .line"
    );
    // console.log(actionID, index);
    const el: any = allSubSteps[index];
    const subSteppers = document.querySelectorAll(
      "#steppersFrame #subSteppers #stepWrapper"
    )[0];
    var x =
      el.offsetLeft -
      subSteppers.getBoundingClientRect().width +
      el.getBoundingClientRect().width;

    var y =
      el.offsetTop -
      subSteppers.getBoundingClientRect().height +
      el.getBoundingClientRect().height;
    subSteppers.scroll({
      top: y,
      left: x,
      behavior: "smooth"
    });
    el.classList.add("glow");
    for (let i = 0; i < index; i++) {
      allSubSteps[i].classList.remove("glow");
      allSubSteps[i].classList.add("success");
      allSubLines[i].classList.add("bg-success");
    }
    for (let j = index + 1; j < allSubSteps.length; j++) {
      allSubSteps[j].classList.remove("glow");
      allSubSteps[j].classList.remove("success");
      allSubLines[j].classList.remove("bg-success");
    }
  }

  async closeSteppers() {
    document
      .querySelectorAll("#steppersFrame")[0]
      .classList.remove("steppersShow");
    await new Promise(resolveTime => setTimeout(resolveTime, 1200));
  }

  toggleSteppers() {
    document
      .querySelectorAll("#steppersFrame")[0]
      .classList.toggle("steppersShow");
  }

  // main proof actions
  async playProofDemo(step: number = this.currentStep) {
    this.isReplay = false;
    this.isPlayCompleted = false;

    const { Header, Steps } = this.proofJSON;

    this.totalSteps = Steps.length;
    this.currentStep = step;
    this.cdr.detectChanges();

    // console.log(this.currentStep);
    for (; this.currentStep < Steps.length; ) {
      this.isBackToStep = false;
      if (this.isPause) return;
      if (this.isReplay) return;
      const stepData = this.parseActionData(Steps[this.currentStep]);
      const { StepHeader, Action, Customizations } = stepData;
      const {
        ActionTitle,
        ActionDescription,
        ActionType,
        ActionParameters
      } = Action;
      // console.log(action.Id, this.demoScreenChildRefs);
      this.currentStep++;
      this.ActionDescription = ActionDescription[this.lang];
      
      
      //console.log("actionDescription2",ActionDescription);
      //console.log("Action1",Action);
      if (StepHeader.SegmentNo) {
        await this.toStepper(StepHeader.SegmentNo, Action._ID);
      }
      const frameID = StepHeader.FrameID;
      this.cdr.detectChanges();

      // console.log(stepData);

      // set global values
      this.setGlobalValuesOnFrames(Header, stepData);

      switch (ActionType) {
        case "BrowserScreen":
          // await this.closeSteppers();
          var scRef: ComponentRef<SiteScreenComponent>;
          if (this.demoScreenChildRefs[frameID])
            scRef = this.demoScreenChildRefs[frameID].ref;
          else {
            scRef = await this.createFrameInProofDemo(stepData);
            scRef.instance.setFrameIndex(
              Object.keys(this.demoScreenChildRefs).length - 1
            );
          }
          this.setGlobalValuesOnFrames(Header, stepData);
          if (scRef && ActionParameters.InnerHTML) {
            scRef.instance.setFrameTitle(StepHeader.FrameTitle[this.lang]);
            await scRef.instance.setPageHTML(
              ActionParameters.ExternalURL,
              ActionParameters.InnerHTML
            );
          } else if (scRef && ActionParameters.ExternalURL) {
            scRef.instance.setFrameTitle(StepHeader.FrameTitle[this.lang]);
            await scRef.instance.setPage(
              ActionParameters.ExternalURL,
              ActionParameters.Translatable,
              this.lang
            );
          }
          break;
        case "UpdateElementAttribute":
          // await this.closeSteppers();
          await this.handleFormatElementAttribute(stepData);
          break;
        case "FormatDOMText":
          // await this.closeSteppers();
          await this.handleTextStyle(stepData);
          break;
        case "UpdateElementProperty":
          // await this.closeSteppers();
          await this.handleSetData(stepData);
          break;
        case "TriggerElementFunction":
          // await this.closeSteppers();
          await this.handleTriggerFn(stepData);
        case "GetElementAttributeData":
          // await this.closeSteppers();
          await this.handleGetDataFn(stepData);
          break;
        case "InformationStorage":
          await this.handleSaveDataFn(stepData);
          break;
        case "FormatMetaData":
          this.handleVariableFormat(stepData);
          break;
        default:
          break;
      }

      // this.isDisableGlobalInformationL = this.isDisableGlobalStorageScroll("L");
      // this.isDisableGlobalInformationR = this.isDisableGlobalStorageScroll("R");

      if (Customizations.ToastMessage) {
        this.toastMSG = Customizations.ToastMessage[this.lang];
        this.toastTop = Customizations.ToastPosition[0];
        this.toastLeft = Customizations.ToastPosition[1];
        this.isToast = true;
      }
      this.cdr.detectChanges();
      await new Promise(resolveTime =>
        setTimeout(
          resolveTime,
          (100 *
            (Customizations.ActionDuration
              ? Customizations.ActionDuration
              : 1)) /
            this.playbackSpeed
        )
      );
      this.isToast = false;
      if (this.lastCompletedStep < this.currentStep)
        this.lastCompletedStep = this.currentStep;
    }

    if (this.currentStep == Steps.length) {
      this.isPlayCompleted = true;
      this.isPause = true;
    }
  }

  parseActionData(action: any, storedData: any = this.variableStorage): any {
    var data = JSON.stringify(action).toString();
    [...data.matchAll(/"\${[^}]+}"|\${[^}]+}/g)].forEach(a => {
      try {
        let key = a[0].match(/\${([^}]+)}/g)[0].slice(2, -1);
        if (key && (storedData[key] != null || storedData[key] != undefined)) {
          var replaceValue = storedData[key];
          var valueType = typeof replaceValue;
          if (valueType == "string" && a[0].match(/"\${[^}]+}"/g)) {
            try {
              var result = JSON.stringify(replaceValue);
              replaceValue = result;
            } catch (error) {
              replaceValue = `"${replaceValue}"`;
            }
          }
          data = data.replace(a[0], replaceValue);
        }
      } catch (error) {}
    });
    //console.log('JSON.parse(data)', JSON.parse(data))
    return JSON.parse(data);
  }

  setGlobalValuesOnFrames(
    Header: any,
    { StepHeader, Action, Customizations }: any
  ) {
    const { FrameID } = StepHeader;
    var ds = this.demoScreenChildRefs[FrameID];
    if (ds) {
      switch (ds.type) {
        case "BrowserScreen":
          var scRef: ComponentRef<SiteScreenComponent>;
          if (this.demoScreenChildRefs[FrameID])
            scRef = this.demoScreenChildRefs[FrameID].ref;
          if (scRef) {
            if (
              Customizations &&
              Object.keys(Customizations).includes("ScrollToPointer")
            ) {
              scRef.instance.isPointToElement = Customizations.ScrollToPointer;
            } else if (
              Header &&
              Object.keys(Header).includes("ScrollToPointer")
            ) {
              scRef.instance.isPointToElement = Header.ScrollToPointer;
            }
          }
      }
    }
  }

  async createFrameInProofDemo(stepData: any): Promise<ComponentRef<any>> {
    const { StepHeader, Action, Customizations } = stepData;
    const { FrameID } = StepHeader;
    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters
    } = Action;

    var component: Type<any>;
    switch (ActionType) {
      case "BrowserScreen":
        component = SiteScreenComponent;
        break;
      default:
        break;
    }
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      component
    );
    const componentDividerFactory = this.componentFactoryResolver.resolveComponentFactory(
      ElementDividerComponent
    );
    const ref = this.proofDemoRef.createComponent(componentFactory);
    this.proofDemoRef.createComponent(componentDividerFactory);
    this.demoScreenChildRefs[FrameID] = {
      Id: FrameID,
      type: ActionType,
      ref,
      ActionTitle
    };
    // ref.location.nativeElement.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    //   inline: "start"
    // });
    this.cdr.detectChanges();
    return ref;
  }

  async handleFormatElementAttribute(stepData: any) {
    const { StepHeader, Action, Customizations } = stepData;

    const { StepNo, SegmentNo, FrameID, FrameTitle } = StepHeader;

    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters,
      ActionResultVariable,
      MetaData
    } = Action;
    
    const {
      ExternalURL,
      InnerHTML,
      Query,
      QueryIndex,
      YOffset,
      XOffset,
      ElAttributeName,
      ElAttributeValue,
      ElAttributeValueReplace,
      ElProperty,
      ElPropertyValue,
      ElFunction,
      ElFunctionArguments,
      SelectiveText,
      CaseSensitivity,
      SelectiveTextIndex,
      CSS,
      StorageData
    } = ActionParameters;

    const {
      PointerData,
      ScrollToPointer,
      FrameAutoScroll,
      FrameScrollBars,
      ToastMessage,
      ToastPosition,
      ActionDuration
    } = Customizations;
    //console.log("action",Action);
    var ds = this.demoScreenChildRefs[FrameID];
    if (ds) {
      switch (ds.type) {
        case "BrowserScreen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && Query)
            await scRef.instance.addAttributeToElement(
              Query,
              QueryIndex,
              ElAttributeValueReplace,
              ElAttributeName,
              ElAttributeValue,
              FrameAutoScroll
            );
          break;
        default:
          break;
      }
    }
  }

  async handleTextStyle(stepData: any) {
    const { StepHeader, Action, Customizations } = stepData;

    const { StepNo, SegmentNo, FrameID, FrameTitle } = StepHeader;

    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters,
      ActionResultVariable,
      MetaData
    } = Action;
    //console.log("action2",Action);
    const {
      ExternalURL,
      InnerHTML,
      Query,
      QueryIndex,
      YOffset,
      XOffset,
      ElAttributeName,
      ElAttributeValue,
      ElAttributeValueReplace,
      ElProperty,
      ElPropertyValue,
      ElFunction,
      ElFunctionArguments,
      SelectiveText,
      CaseSensitivity,
      SelectiveTextIndex,
      CSS,
      StorageData
    } = ActionParameters;

    const {
      PointerData,
      ScrollToPointer,
      FrameAutoScroll,
      FrameScrollBars,
      ToastMessage,
      ToastPosition,
      ActionDuration
    } = Customizations;

    var ds = this.demoScreenChildRefs[FrameID];
    if (ds) {
      switch (ds.type) {
        case "BrowserScreen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && SelectiveText)
            await scRef.instance.styleText(
              SelectiveText,
              CaseSensitivity,
              SelectiveTextIndex,
              CSS
            );
          break;
        default:
          break;
      }
    }
  }

  async handleSetData(stepData: any) {
    const { StepHeader, Action, Customizations } = stepData;

    const { StepNo, SegmentNo, FrameID, FrameTitle } = StepHeader;

    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters,
      ActionResultVariable,
      MetaData
    } = Action;
    //console.log("action3",Action);
    const {
      ExternalURL,
      InnerHTML,
      Query,
      QueryIndex,
      YOffset,
      XOffset,
      ElAttributeName,
      ElAttributeValue,
      ElAttributeValueReplace,
      ElProperty,
      ElPropertyValue,
      ElFunction,
      ElFunctionArguments,
      SelectiveText,
      CaseSensitivity,
      SelectiveTextIndex,
      CSS,
      StorageData
    } = ActionParameters;

    const {
      PointerData,
      ScrollToPointer,
      FrameAutoScroll,
      FrameScrollBars,
      ToastMessage,
      ToastPosition,
      ActionDuration
    } = Customizations;

    var ds = this.demoScreenChildRefs[FrameID];
    if (ds) {
      switch (ds.type) {
        case "BrowserScreen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && Query && ElProperty && ElPropertyValue)
            await scRef.instance.setData(
              Query,
              QueryIndex,
              ElProperty,
              ElPropertyValue
            );
          break;
        default:
          break;
      }
    }
  }

  async handleTriggerFn(stepData: any) {
    const { StepHeader, Action, Customizations } = stepData;

    const { StepNo, SegmentNo, FrameID, FrameTitle } = StepHeader;

    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters,
      ActionResultVariable,
      MetaData
    } = Action;
    //console.log("action4",Action);
    const {
      ExternalURL,
      InnerHTML,
      Query,
      QueryIndex,
      YOffset,
      XOffset,
      ElAttributeName,
      ElAttributeValue,
      ElAttributeValueReplace,
      ElProperty,
      ElPropertyValue,
      ElFunction,
      ElFunctionArguments,
      SelectiveText,
      CaseSensitivity,
      SelectiveTextIndex,
      CSS,
      StorageData
    } = ActionParameters;

    const {
      PointerData,
      ScrollToPointer,
      FrameAutoScroll,
      FrameScrollBars,
      ToastMessage,
      ToastPosition,
      ActionDuration
    } = Customizations;

    var ds = this.demoScreenChildRefs[FrameID];
    if (ds) {
      switch (ds.type) {
        case "BrowserScreen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && Query && ElFunction && ElFunctionArguments) {
            const result = await scRef.instance.triggerFunction(
              Query,
              QueryIndex,
              ElFunction,
              ElFunctionArguments
            );
            if (ActionResultVariable)
              this.variableStorage[ActionResultVariable] = result;
          }
          break;
        default:
          break;
      }
    }
  }

  async handleGetDataFn(stepData: any) {
    const { StepHeader, Action, Customizations } = stepData;

    const { StepNo, SegmentNo, FrameID, FrameTitle } = StepHeader;

    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters,
      ActionResultVariable,
      MetaData
    } = Action;
    //console.log("action5",Action);
    const {
      ExternalURL,
      InnerHTML,
      Query,
      QueryIndex,
      YOffset,
      XOffset,
      ElAttributeName,
      ElAttributeValue,
      ElAttributeValueReplace,
      ElProperty,
      ElPropertyValue,
      ElFunction,
      ElFunctionArguments,
      SelectiveText,
      CaseSensitivity,
      SelectiveTextIndex,
      CSS,
      StorageData
    } = ActionParameters;

    const {
      PointerData,
      ScrollToPointer,
      FrameAutoScroll,
      FrameScrollBars,
      ToastMessage,
      ToastPosition,
      ActionDuration
    } = Customizations;

    var ds = this.demoScreenChildRefs[FrameID];
    if (ds) {
      switch (ds.type) {
        case "BrowserScreen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && ElAttributeName) {
            const result = await scRef.instance.getData(
              Query,
              QueryIndex,
              ElAttributeName
            );
            if (ActionResultVariable)
              this.variableStorage[ActionResultVariable] = result;
          }
          break;
        default:
          break;
      }
    }
  }

  handleVariableFormat(stepData: any) {
    const { StepHeader, Action, Customizations } = stepData;

    const { StepNo, SegmentNo, FrameID, FrameTitle } = StepHeader;

    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters,
      ActionResultVariable,
      MetaData
    } = Action;
    //console.log("action6",Action);
    const {
      ExternalURL,
      InnerHTML,
      Query,
      QueryIndex,
      YOffset,
      XOffset,
      ElAttributeName,
      ElAttributeValue,
      ElAttributeValueReplace,
      ElProperty,
      ElPropertyValue,
      ElFunction,
      ElFunctionArguments,
      SelectiveText,
      CaseSensitivity,
      SelectiveTextIndex,
      CSS,
      FormatType,
      StorageData
    } = ActionParameters;

    const {
      PointerData,
      ScrollToPointer,
      FrameAutoScroll,
      FrameScrollBars,
      ToastMessage,
      ToastPosition,
      ActionDuration
    } = Customizations;
    var val = this.variableStorage[MetaData[0]];
    switch (FormatType) {
      case "parseJson":
        try {
          //console.log('JSON.parse(val)', JSON.parse(val))
          var res = JSON.parse(val);
          this.variableStorage[ActionResultVariable] = res;
        } catch (error) {
          this.variableStorage[ActionResultVariable] = MetaData[0];
        }
        break;
      case "stringifyJson":
        this.variableStorage[ActionResultVariable] = JSON.stringify(val);
        break;
      case "jsonKeyPicker":
        var result = this.jsonKeyPicker(val, MetaData[1], MetaData[2])[1];
        if (MetaData[3])
          this.variableStorage[ActionResultVariable] = result[MetaData[3]];
        else this.variableStorage[ActionResultVariable] = result;
        // console.log(this.variableStorage[ActionResultVariable]);
        break;
      case "jsonValueObjectPicker":
        this.variableStorage[ActionResultVariable] = this.jsonValueObjectPicker(
          val,
          MetaData[1],
          MetaData[2]
        )[MetaData[3]];
        // console.log(this.variableStorage);
        break;
      default:
        break;
    }
  }

  findAllValuesOfAKey(obj: any, key: string, caseSensitive: boolean = true) {
    var values = [];
    key = !caseSensitive ? key.toLowerCase() : key;
    for (var i in obj) {
      i = !caseSensitive ? i.toLowerCase() : i;
      if (key == i) values.push(obj[i]);
      if (obj.hasOwnProperty(i)) {
        var sValues = this.findAllValuesOfAKey(obj[i], key, caseSensitive);
        values = values.concat(sValues);
      }
    }
    return values;
  }

  jsonKeyPicker(obj: any, k: string, selfReturn: boolean = false) {
    for (var key in obj) {
      var value = obj[key];

      if (k == key) {
        return [k, value];
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        var y = this.jsonKeyPicker(value, k, selfReturn);
        if (y && y[0] == k) return y;
      }
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; ++i) {
          var x = this.jsonKeyPicker(value[i], k, selfReturn);
          if (x && x[0] == k) return x;
        }
      }
    }
    return selfReturn ? obj : null;
  }

  jsonValueObjectPicker(obj: any, v: string, caseSensitive: boolean = false) {
    // console.log(obj, v);
    for (var key in obj) {
      v = !caseSensitive ? v.toLowerCase() : v;
      var value = obj[key];
      if (typeof value === "object" && !Array.isArray(value)) {
        var r = this.jsonValueObjectPicker(value, v, caseSensitive);
        if (Object.keys(r).length > 0) return r;
      } else if (Array.isArray(value)) {
        for (var i = 0; i < value.length; ++i) {
          var r = this.jsonValueObjectPicker(value[i], v, caseSensitive);
          if (Object.keys(r).length > 0) return r;
        }
      } else {
        value = value.toString();
        value = !caseSensitive && value.toLowerCase();
        if (v == value) return obj;
      }
    }
    return {};
  }

  async handleSaveDataFn(stepData: any) {
    const { StepHeader, Action, Customizations } = stepData;

    const { StepNo, SegmentNo, FrameID, FrameTitle } = StepHeader;

    const {
      ActionTitle,
      ActionDescription,
      ActionType,
      ActionParameters,
      ActionResultVariable,
      MetaData
    } = Action;
    //console.log("action6",Action);
    const {
      ExternalURL,
      InnerHTML,
      Query,
      QueryIndex,
      YOffset,
      XOffset,
      ElAttributeName,
      ElAttributeValue,
      ElAttributeValueReplace,
      ElProperty,
      ElPropertyValue,
      ElFunction,
      ElFunctionArguments,
      SelectiveText,
      CaseSensitivity,
      SelectiveTextIndex,
      CSS,
      FormatType,
      StorageData
    } = ActionParameters;

    const {
      PointerData,
      ScrollToPointer,
      FrameAutoScroll,
      FrameScrollBars,
      ToastMessage,
      ToastPosition,
      ActionDuration
    } = Customizations;
    this.addDataToGlobalData(
      FrameID,
      this.demoScreenChildRefs[FrameID].ShortFrameTitle,
      StorageData
    );
  }

  async addDataToGlobalData(Id: number, Title: string, Data: object[]) {
    var index = this.globalData.findIndex((curr: any) => curr.Id == Id);
    if (index == -1) {
      index = this.globalData.length;
      this.globalData.push({
        Id,
        Title,
        Data
      });
    } else {
      const curr: any = this.globalData[index];
      for (let j = 0; j < Data.length; j++) {
        const dataItem: any = Data[j];
        var i = curr.Data.findIndex((curr: any) => curr.Key == dataItem.Key);
        if (i != -1) curr.Data[i].Value = dataItem.Value;
        else curr.Data = [...curr.Data, dataItem];
      }
      this.globalData = [
        ...this.globalData.slice(0, index),
        curr,
        ...this.globalData.slice(index + 1)
      ];
    }
    this.cdr.detectChanges();
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
    await this.scrollIntoStorageView(Id);
    var indexTable: any = document
      .querySelectorAll("#globalInformation #gsFrames proof-global-storage")
      [index].querySelectorAll(".data-table")[0];
    indexTable.scrollTop = indexTable.scrollHeight;
  }

  async scrollIntoStorageView(id: number) {
    const index = this.globalData.findIndex((curr: any) => curr.Id == id);
    if (index == -1) return;
    const el: any = document.querySelectorAll(
      "#globalInformation #gsFrames proof-global-storage"
    )[index];
    // await this.scrollToFrameById("proofContainer", 0);
    // console.log(el);
    var gsFrame = document.querySelectorAll("#globalInformation #gsFrames")[0];
    var gsFrameRect: any = gsFrame.getBoundingClientRect();
    var initialWidth = gsFrameRect.x;
    gsFrame.scroll({
      top: 0,
      left: el.offsetLeft - initialWidth,
      behavior: "smooth"
    });
    await new Promise(resolveTime => setTimeout(resolveTime, 1200));
    el.scroll({
      top: el.scrollHeight,
      left: 0,
      behavior: "smooth"
    });
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
  }

  scrollWithinGlobalStorage(side: string) {
    var globalInformationScrollPos = document.querySelectorAll(
      "#globalInformation #gsFrames"
    )[0].scrollLeft;
    var minScrollWidth =
      document
        .querySelectorAll("#globalInformation #gsFrames")[0]
        .getBoundingClientRect().width / 4;
    switch (side) {
      case "L":
        if (globalInformationScrollPos - minScrollWidth >= 0)
          globalInformationScrollPos -= minScrollWidth;
        else globalInformationScrollPos = 0;
        break;
      default:
        var maxRange = document.querySelectorAll(
          "#globalInformation #gsFrames"
        )[0].scrollWidth;
        if (globalInformationScrollPos + minScrollWidth <= maxRange)
          globalInformationScrollPos += minScrollWidth;
        else globalInformationScrollPos = maxRange;
    }
    document.querySelectorAll("#globalInformation #gsFrames")[0].scrollTo({
      top: 0,
      left: globalInformationScrollPos,
      behavior: "smooth"
    });

    this.isDisableGlobalInformationL = this.isDisableGlobalStorageScroll("L");
    this.isDisableGlobalInformationR = this.isDisableGlobalStorageScroll("R");
  }

  isDisableGlobalStorageScroll(side: string): boolean {
    try {
      var globalInformationScrollPos = document.querySelectorAll(
        "#globalInformation #gsFrames"
      )[0].scrollLeft;
      switch (side) {
        case "L":
          if (globalInformationScrollPos == 0) return true;
          break;
        default:
          var globalInformationFrame: any = document.querySelectorAll(
            "#globalInformation #gsFrames"
          )[0];
          if (
            globalInformationFrame.scrollLeft +
              globalInformationFrame.offsetWidth >=
            globalInformationFrame.scrollWidth
          )
            return true;
      }
    } catch (error) {
      return true;
    }
    return false;
  }

  // to understand the process
  verifyBackLinkVerify() {
    return {
      // 1 BrowserScreen TXNHash2 - F1
      // 2 get-data body TXN text and store to variable MainTXNData - F1
      // 3 format MainTXNData variable to json and replace
      // 4 access MainTXNData variable for CurentTXNHash and store as MainTXNCurentTXNHash
      // 5 currentTXNHash style key - F1
      // 6 currentTXNHash style MainTXNCurentTXNHash - F1
      // 7 site-screen decode MainTXNCurentTXNHash - F2
      // 8 input CurentTXNHash - F2
      // 9 click fn decode btn - F2
      // 10 get output and save to local variable - F2
      // 11 refer that variable and save in Global storage frame - F2 G1
      // 12 site-screen CurrentTXNHash - F3
      // 13 get-data body TXN text and store to variable MainTXNCurentTXNData - F3
      // 14 format MainTXNCurentTXNData variable to json and replace
      // 15 access MainTXNCurentTXNData variable for identifier and store as MainTXNCurentTXNDataIdentifier
      // 16 identifier style key - F3
      // 17 identifier style value - F3
      // 18 site-screen decode identifier - F4
      // 19 input identifier - F4
      // 20 click fn - F4
      // 21 get output and save to local variable - F4
      // 22 refer that variable and save in Global storage frame - F4 G2
      // 23 access MainTXNCurentTXNData variable for productId and store as MainTXNCurentTXNDataProductId
      // 24 ProductID style key - F3
      // 25 ProductID style value - F3
      // 26 site-screen decode ProductID - F6
      // 27 input ProductID - F6
      // 28 click fn - F6
      // 29 get output and save to local variable - F6
      // 30 refer that variable and save in Global storage frame - F6 G3
      // 31 access MainTXNData variable for PreviousTXN and store as MainTXNPreviousTXN
      // 32 PreviousTXNHash style key - F1
      // 33 PreviousTXNHash style value - F1
      // 34 site-screen decode PreviousTXNHash - F7
      // 35 input PreviousTXNHash - F7
      // 36 click fn decode btn - F7
      // 37 get output and save to local variable - F7
      // 38 refer that variable and save in Global storage frame - F7 G4
      // 39 site-screen PreviousTXNHash - F8
      // 40 get-data body TXN text and store to variable MainTXNPreviousTXNData - F8
      // 41 format MainTXNPreviousTXNData variable to json and replace
      // 42 access MainTXNPreviousTXNData variable for CurentTXNHash and store as MainTXNPreviousTXNCurrentTXNHash
      // 43 currentTXNHash style key - F8
      // 44 currentTXNHash style value - F8
      // 45 site-screen decode CurentTXNHash - F9
      // 46 input CurentTXNHash - F9
      // 47 click fn decode btn - F9
      // 48 get output and save to local variable - F9
      // 49 refer that variable and save in Global storage frame - F9 G5
      // 50 site-screen CurrentTXNHash - F10
      // 51 get-data body TXN text and store to variable MainTXNPreviousTXNCurrentTXNData - F10
      // 52 format MainTXNPreviousTXNCurrentTXNData variable to json and replace
      // 53 access MainTXNPreviousTXNCurrentTXNData variable for identifier and store as MainTXNPreviousTXNCurrentTXNDataIdentifier
      // 54 identifier style key - F10
      // 55 identifier style value - F10
      // 56 site-screen decode identifier - F11
      // 57 input identifier - F11
      // 58 click fn - F11
      // 59 get output and save to local variable - F11
      // 60 refer that variable and save in Global storage frame - F11 G6
      // 61 access MainTXNPreviousTXNCurrentTXNData variable for productId and store as MainTXNPreviousTXNCurrentTXNDataProductID
      // 62 ProductID style key - F10
      // 63 ProductID style value - F10
      // 64 site-screen decode ProductID - F12
      // 65 input ProductID - F12
      // 66 click fn - F12
      // 67 get output and save to local variable - F12
      // 68 refer that variable and save in Global storage frame - F12 G7
      // 54 compare identifiers from TXNHash2 CurrentTXNHash and TXNHash2 PreviousTXN CurrentTXNHash
      // 55 Backlink verification status
    };
  }
}
