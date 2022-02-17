import { animate, style, transition, trigger } from "@angular/animations";
import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ElementDividerComponent } from "../components/element-divider/element-divider.component";
import { SiteScreenComponent } from "../components/site-screen/site-screen.component";

@Component({
  selector: "app-verification-screen",
  templateUrl: "./verification-screen.component.html",
  styleUrls: ["./verification-screen.component.css"],
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
export class VerificationScreenComponent implements OnInit {
  StorageTitle: string = "Storage Container";
  ProofContainerTitle: string = "Proof Container";
  currentStep: number = 0;
  lastCompletedStep: number = 0;
  totalSteps: number = 0;
  gsHeightExpand: boolean = false;
  vsHeightExpand: boolean = false;
  isStartDemo: boolean = false;
  isPause: boolean = false;
  isReplay: boolean = false;
  isLoading: boolean = false;
  isPlayCompleted: boolean = false;
  variableStorage: any = {};
  proofJSON: any = {};
  globalData: object[] = [];
  steppers: any[] = [];
  demoScreenChildRefs: any = {};
  color = "primary";
  mode = "indeterminate";
  value = 10;
  gsOverflowX: string = "hidden";
  vsOverflowX: string = "hidden";
  ActionDescription: string = "";
  TXNhash: string = "";
  playbackSpeed: number = 1;
  routerParams: any = {};
  isDisableGlobalInformationL: boolean = true;
  isDisableGlobalInformationR: boolean = true;
  isBackToStep: boolean = false;
  isToast: boolean = false;
  toastMSG: string;
  toastTop: string = "40%";
  toastLeft: string = "32%";

  @ViewChild("ProofDemoDirective", { read: ViewContainerRef, static: false })
  proofDemoRef: ViewContainerRef;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.routerParams = { ...params.keys, ...params };
    });
  }

  async ngAfterViewInit() {
    this.scrollToFrameById("proofContainer");
    this.cdr.detectChanges();
  }

  async scrollToFrameById(frameID: string, lower = 0) {
    const bodyRect: any = document.body.getBoundingClientRect();
    const pcRect: any = document
      .getElementById(frameID)
      .getBoundingClientRect();
    const pcWidth = pcRect.x - bodyRect.x;
    const pcHeight = pcRect.y - bodyRect.y;
    window.scroll({
      top: pcHeight - lower,
      left: pcWidth,
      behavior: "smooth"
    });
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
  }

  async createFrameInProofDemo(action: any): Promise<ComponentRef<any>> {
    const { FrameId, Type, ShortFrameTitle } = action;
    var component: Type<any>;
    switch (Type) {
      case "site-screen":
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
    this.demoScreenChildRefs[FrameId] = {
      Id: FrameId,
      type: Type,
      ref,
      ShortFrameTitle
    };
    // ref.location.nativeElement.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    //   inline: "start"
    // });
    this.cdr.detectChanges();
    return ref;
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

  togglePlayPauseFn() {
    this.isPause = !this.isPause;
    if (this.isPlayCompleted) this.currentStep = 0;
    this.playProofDemo();
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
    // this.color = "primary";
    // this.mode = "indeterminate";
    // this.value = 10;
    // this.gsOverflowX= "hidden";
    // this.vsOverflowX= "hidden";
    this.ActionDescription = "";
    // this.TXNhash= "";
    this.playbackSpeed = 1;
    // this.routerParams = {};
    this.isDisableGlobalInformationL = true;
    this.isDisableGlobalInformationR = true;
    this.isBackToStep = false;

    this.proofDemoRef.clear();
    this.cdr.detectChanges();
    this.playProofDemo();
  }

  async startDemoFn() {
    if (
      this.routerParams &&
      this.routerParams.params &&
      this.routerParams.params.type == "pobl"
    ) {
      this.TXNhash = this.routerParams.params.txn;
      this.isLoading = true;
      await new Promise(resolveTime => setTimeout(resolveTime, 4200));
      this.isStartDemo = true;
      this.isPause = true;
      this.initiateProofDemo();
      await new Promise(resolveTime => setTimeout(resolveTime, 600));
      this.isPause = false;
      await this.scrollToFrameById("proofHeaderTitle", 20);
      this.playProofDemo(0);
    } else
      alert("Proof verification is not yet available for the selected type.");
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
    // this.routerParams = {};
    this.isDisableGlobalInformationL = true;
    this.isDisableGlobalInformationR = true;
    this.isBackToStep = false;
  }

  backToStep(stepNo: number) {
    var i: number = this.proofJSON.Steps.findIndex(
      (cur: any) => cur.StepTo == stepNo
    );
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

  selectSpeedFn() {
    let speed: any = prompt(
      "Playback speed (0.5, 0.25, 1, 1.5, 2)",
      this.playbackSpeed.toString()
    );
    if (!speed || isNaN(speed) || speed == 0)
      alert("Please enter a valid playback speed.");
    else this.setSpeed(speed);
  }

  setSpeed(speed: number) {
    this.playbackSpeed = speed;
  }

  async initiateProofDemo() {
    this.proofJSON = this.getSampleUI();
    this.playProofDemo(0);
  }

  async playProofDemo(step: number = this.currentStep) {
    const data = this.proofJSON;
    this.currentStep = step;
    this.StorageTitle = data.StorageTitle;
    this.ProofContainerTitle = data.ProofContainerTitle;
    this.totalSteps = data.Steps.length;
    this.steppers = data.Steppers;
    this.cdr.detectChanges();
    this.isReplay = false;
    this.isPlayCompleted = false;
    this.playbackSpeed = data.PlaybackSpeed;
    // console.log(this.currentStep);
    for (; this.currentStep < data.Steps.length; ) {
      this.isBackToStep = false;
      if (this.isPause) return;
      if (this.isReplay) return;
      const action = this.parseActionData(data.Steps[this.currentStep]);
      // console.log(action.Id, this.demoScreenChildRefs);
      this.currentStep++;
      this.ActionDescription = action.ActionDescription;
      if (action.StepTo) {
        this.toStepper(action.StepTo);
      }
      const frameID = action.FrameId;
      this.cdr.detectChanges();

      // set global values
      this.setGlobalValuesOnFrames(data, action);

      switch (action.Type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent>;
          if (this.demoScreenChildRefs[frameID])
            scRef = this.demoScreenChildRefs[frameID].ref;
          else {
            scRef = await this.createFrameInProofDemo(action);
            scRef.instance.setFrameIndex(
              Object.keys(this.demoScreenChildRefs).length - 1
            );
          }
          this.setGlobalValuesOnFrames(data, action);
          if (scRef && action.InnerHTML) {
            scRef.instance.setFrameTitle(action.FrameTitle);
            await scRef.instance.setPageHTML(action.PageURL, action.InnerHTML);
          } else if (scRef && action.PageURL) {
            scRef.instance.setFrameTitle(action.FrameTitle);
            await scRef.instance.setPage(action.PageURL);
          }
          break;
        case "element-attribute":
          await this.handleFormatElementAttribute(action);
          break;
        case "text-style":
          await this.handleTextStyle(action);
          break;
        case "set-data":
          await this.handleSetData(action);
          break;
        case "trigger-fn":
          await this.handleTriggerFn(action);
        case "get-data":
          await this.handleGetDataFn(action);
          break;
        case "save-data":
          await this.handleSaveDataFn(action);
          break;
        case "format-data":
          this.handleVariableFormat(action);
          break;
        default:
          break;
      }

      this.isDisableGlobalInformationL = this.isDisableGlobalStorageScroll("L");
      this.isDisableGlobalInformationR = this.isDisableGlobalStorageScroll("R");

      if (action.ToastMessage) {
        this.toastMSG = action.ToastMessage;
        this.toastTop = action.ToastPosition[0];
        this.toastLeft = action.ToastPosition[1];
        this.isToast = true;
      }
      this.cdr.detectChanges();
      await new Promise(resolveTime =>
        setTimeout(
          resolveTime,
          (100 * (action.ActionSpeed ? action.ActionSpeed : 1)) /
            this.playbackSpeed
        )
      );
      this.isToast = false;
      if (this.lastCompletedStep < this.currentStep)
        this.lastCompletedStep = this.currentStep;
    }

    if (this.currentStep == data.Steps.length) {
      this.isPlayCompleted = true;
      this.isPause = true;
    }
  }

  setGlobalValuesOnFrames(data: any, action: any) {
    const { FrameId } = action;
    var ds = this.demoScreenChildRefs[FrameId];
    if (ds) {
      switch (ds.type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent>;
          if (this.demoScreenChildRefs[FrameId])
            scRef = this.demoScreenChildRefs[FrameId].ref;
          if (scRef) {
            if (Object.keys(action).includes("ScrollToPointer")) {
              scRef.instance.isPointToElement = action.ScrollToPointer;
            } else if (Object.keys(data).includes("ScrollToPointer")) {
              scRef.instance.isPointToElement = data.ScrollToPointer;
            }
          }
      }
    }
  }

  async handleFormatElementAttribute(action: any) {
    const {
      FrameId,
      Query,
      EIndex,
      Attribute,
      Value,
      ValueReplacement,
      AutoScroll
    } = action;
    var ds = this.demoScreenChildRefs[FrameId];
    if (ds) {
      switch (ds.type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && Query)
            await scRef.instance.addAttributeToElement(
              Query,
              EIndex,
              ValueReplacement,
              Attribute,
              Value,
              AutoScroll
            );
          break;
        default:
          break;
      }
    }
  }

  async handleTextStyle(action: any) {
    const { FrameId, HText, CaseSensitive, TextIndex, StyleCSS } = action;
    var ds = this.demoScreenChildRefs[FrameId];
    if (ds) {
      switch (ds.type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && HText)
            await scRef.instance.styleText(
              HText,
              CaseSensitive,
              TextIndex,
              StyleCSS
            );
          break;
        default:
          break;
      }
    }
  }

  async handleSetData(action: any) {
    const { FrameId, Query, EIndex, Selector, Data } = action;
    var ds = this.demoScreenChildRefs[FrameId];
    if (ds) {
      switch (ds.type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && Query && Selector && Data)
            await scRef.instance.setData(Query, EIndex, Selector, Data);
          break;
        default:
          break;
      }
    }
  }

  async handleTriggerFn(action: any) {
    const { FrameId, Query, EIndex, Event, Data, RVariable } = action;
    var ds = this.demoScreenChildRefs[FrameId];
    if (ds) {
      switch (ds.type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && Query && Event && Data) {
            const result = await scRef.instance.triggerFunction(
              Query,
              EIndex,
              Event,
              Data
            );
            if (RVariable) this.variableStorage[RVariable] = result;
          }
          break;
        default:
          break;
      }
    }
  }

  async handleGetDataFn(action: any) {
    const { FrameId, Query, EIndex, selector, RVariable } = action;
    var ds = this.demoScreenChildRefs[FrameId];
    if (ds) {
      switch (ds.type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent> = ds.ref;
          if (scRef && selector) {
            const result = await scRef.instance.getData(
              Query,
              EIndex,
              selector
            );
            if (RVariable) this.variableStorage[RVariable] = result;
          }
          break;
        default:
          break;
      }
    }
  }

  handleVariableFormat(action: any) {
    const { Variable, Formater, Data, RVariable } = action;
    var val = this.variableStorage[Variable];
    switch (Formater) {
      case "parseJson":
        this.variableStorage[RVariable] = JSON.parse(val);
        break;
      case "stringifyJson":
        this.variableStorage[RVariable] = JSON.stringify(val);
        break;
      case "jsonKeyPicker":
        this.variableStorage[RVariable] = this.jsonKeyPicker(val, Data[0]);
        break;
      case "jsonValueObjectPicker":
        this.variableStorage[RVariable] = this.jsonValueObjectPicker(
          val,
          Data[0]
        )[Data[1]];
        break;
      default:
        break;
    }
  }

  toStepper(no: number) {
    const steppersFrame = document.querySelectorAll(
      "#steppersFrame .bs-stepper"
    )[0];
    const allSteps = document.querySelectorAll(
      ".bs-stepper-header.cs-stepper-header .step"
    );
    const el: any = allSteps[no - 1];
    el.classList.add("glow");
    // allSteps[no - 1].scrollIntoView();
    steppersFrame.scroll({
      top: 0,
      left:
        el.offsetLeft -
        steppersFrame.getBoundingClientRect().width +
        el.getBoundingClientRect().width,
      behavior: "smooth"
    });
    for (let i = 0; i < no - 1; i++) {
      allSteps[i].classList.remove("glow");
      allSteps[i].classList.add("success");
    }
    for (let j = no; j < allSteps.length; j++) {
      allSteps[j].classList.remove("glow");
      allSteps[j].classList.remove("success");
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

  jsonKeyPicker(obj: any, k: string) {
    for (var key in obj) {
      var value = obj[key];

      if (k == key) {
        return [k, value];
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        var y = this.jsonKeyPicker(value, k);
        if (y && y[0] == k) return y;
      }
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; ++i) {
          var x = this.jsonKeyPicker(value[i], k);
          if (x && x[0] == k) return x;
        }
      }
    }
    return null;
  }

  jsonValueObjectPicker(obj: any, v: string, caseSensitive: boolean = false) {
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

  async handleSaveDataFn(action: any) {
    const { FrameId, Data } = action;
    this.addDataToGlobalData(
      FrameId,
      this.demoScreenChildRefs[FrameId].ShortFrameTitle,
      Data
    );
  }

  async scrollIntoStorageView(id: number) {
    const index = this.globalData.findIndex((curr: any) => curr.Id == id);
    if (index == -1) return;
    const el: any = document.querySelectorAll(
      "#globalInformation #frames proof-global-storage"
    )[index];
    await this.scrollToFrameById("proofContainer", 0);
    document.querySelectorAll("#globalInformation #frames")[0].scroll({
      top: 0,
      left: el.offsetLeft - 66,
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
      .querySelectorAll("#globalInformation #frames proof-global-storage")
      [index].querySelectorAll(".data-table")[0];
    indexTable.scrollTop = indexTable.scrollHeight;
  }

  parseActionData(action: any): any {
    var data = JSON.stringify(action).toString();
    [...data.matchAll(/\${[^"}]+}/g)].forEach(a => {
      let variable = a[0];
      let key = variable.slice(2, -1);
      key &&
        this.variableStorage[key] &&
        (data = data.replace(a[0], this.variableStorage[key]));
    });
    return JSON.parse(data);
  }

  scrollWithinGlobalStorage(side: string) {
    var globalInformationScrollPos = document.querySelectorAll(
      "#globalInformation #frames"
    )[0].scrollLeft;
    var minScrollWidth =
      document
        .querySelectorAll("#globalInformation #frames")[0]
        .getBoundingClientRect().width / 4;
    switch (side) {
      case "L":
        if (globalInformationScrollPos - minScrollWidth >= 0)
          globalInformationScrollPos -= minScrollWidth;
        else globalInformationScrollPos = 0;
        break;
      default:
        var maxRange = document.querySelectorAll(
          "#globalInformation #frames"
        )[0].scrollWidth;
        if (globalInformationScrollPos + minScrollWidth <= maxRange)
          globalInformationScrollPos += minScrollWidth;
        else globalInformationScrollPos = maxRange;
    }
    document.querySelectorAll("#globalInformation #frames")[0].scrollTo({
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
        "#globalInformation #frames"
      )[0].scrollLeft;
      switch (side) {
        case "L":
          if (globalInformationScrollPos == 0) return true;
          break;
        default:
          var globalInformationFrame: any = document.querySelectorAll(
            "#globalInformation #frames"
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

  setServices() {}

  //this.history.pushState({}, "", '/multiplecompare/[{"title":"sasasa","t1":"qwqwqw","t2":"212dsdsd"}]')
  //location.reload()
  //https://text-comparison-server.herokuapp.com/multiplecompare/[{"title":"sasasa","t1":"qwqwqw","t2":"212dsdsd"}]

  getSampleUI() {
    return {
      Title: "",
      Description: "",
      StorageTitle: "Information Storage",
      ProofContainerTitle: "",
      NoOfFrames: 4,
      NoOFActions: 40,
      PlaybackSpeed: 1,
      ScrollToPointer: true,
      Steppers: [
        {
          NO: 1,
          Name: "GET Stellar Transaction"
        },
        {
          NO: 2,
          Name: "Decode Current TXNHash"
        },
        {
          NO: 3,
          Name: "GET Current Transaction"
        },
        {
          NO: 4,
          Name: "Decode Identifier"
        },
        {
          NO: 5,
          Name: "Decode Product ID"
        },
        {
          NO: 6,
          Name: "Decode Backlink TXNHash"
        },
        {
          NO: 7,
          Name: "GET Backlink Transaction"
        },
        {
          NO: 8,
          Name: "Decode Current Transaction"
        },
        {
          NO: 9,
          Name: "GET Current Transaction"
        },
        {
          NO: 10,
          Name: "Decode Identifier"
        },
        {
          NO: 11,
          Name: "Decode Product ID"
        },
        {
          NO: 12,
          Name: "Comparison"
        },
        {
          NO: 13,
          Name: "Summary"
        }
      ],
      Steps: [
        {
          StepNo: 1,
          StepTo: 1,
          SegmentNo: 1,
          Title: "Step 1 - Retrieve Current Transaction",
          Discription: "Step 1 - Retrieve Current Transaction .....",
          Action: {
            Type: "BrowserScreen",
            Speed: 30,
            Description:
              "Retrieve the current transaction from Stellar Blockchain.",
            Toast: "Retrieve Blockchain Transaction",
            Parameters: {
              ServiceURL: `https://horizon-testnet.stellar.org/transactions/${this.TXNhash}/operations`,
              InnerHTML: ``,

              Query: "",
              QuerySelector: "",
              ElementIndex: "",

              FormatData: "",
              FormatType: "",
              FormatParameters: "",

              InputData: "",
              OutputVariable: "",
              EventProperty: "",

              TextSelector: "${MainTXNCurentTXNHash}",
              CaseSensitive: true,
              TextIndex: 0,
              TextStyle: "",

              StorageView: [
                {
                  Key: "TXN2 CurrentTXN",
                  Value: "${var_currenttxn}"
                }
              ],
              DocumentationLink: ""
            }
          }
        },
        {
          Id: 1,
          StepTo: 1,
          FrameTitle: "Step 1 - Retrieve Current Transaction",
          ShortFrameTitle: "Step 1",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription:
            "Retrieve the current transaction from Stellar Blockchain.",
          FrameId: 1,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: `https://horizon-testnet.stellar.org/transactions/${this.TXNhash}/operations`,
          ScrollToPointer: false
        },
        {
          Id: 2,
          ActionTitle: "",
          ActionDescription:
            "Format transaction data to JSON (Javascript Object Notation)",
          FrameId: 1,
          ActionSpeed: 2,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNDataString",
          ScrollToPointer: false
        },
        {
          Id: 3,
          ActionTitle: "",
          ActionDescription:
            "Format transaction data to JSON (Javascript Object Notation)",
          FrameId: 2,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNDataString",
          Formater: "parseJson",
          Data: null,
          RVariable: "MainTXNData",
          ScrollToPointer: false
        },
        {
          Id: 4,
          StepTo: 2,
          ActionTitle: "",
          ActionDescription:
            "Select the CurrentTXN Hash (base64 encoded) from the transaction details.",
          FrameId: 2,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["CurrentTXN", "value"],
          RVariable: "MainTXNCurentTXNHash"
        },
        // select CurrentTXN
        {
          Id: 5,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded CurrentTXN Hash from the transaction details.",
          FrameId: 1,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "CurrentTXN",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },
        {
          Id: 6,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded CurrentTXN Hash from the transaction details.",
          FrameId: 1,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "${MainTXNCurentTXNHash}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },
        {
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the base64 encoded CurrentTXN Hash value for future usage.",
          FrameId: 1,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "TXN2 CurrentTXN (base64)",
              Value: "${MainTXNCurentTXNHash}"
            }
          ]
        },
        // decode currenttxnhash
        {
          Id: 7,
          FrameTitle: "Step 2 - Decode CurrentTXN",
          ShortFrameTitle: "Step 2 - Decode CurrentTXN",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded CurrentTXN Hash value",
          FrameId: 2,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html",
          ScrollToPointer: false
        },
        {
          Id: 8,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded CurrentTXN Hash value.",
          FrameId: 2,
          ActionSpeed: 10,
          Type: "set-data",
          Query: ".input textarea",
          EIndex: 0,
          Selector: "value",
          Data: "${MainTXNCurentTXNHash}"
        },
        {
          Id: 9,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded CurrentTXN Hash value.",
          FrameId: 2,
          ActionSpeed: 2,
          Type: "trigger-fn",
          Query: ".btn.btn-default",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 10,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded CurrentTXN Hash value.",
          FrameId: 2,
          ActionSpeed: 30,
          Type: "get-data",
          Query: ".output textarea",
          EIndex: 0,
          selector: "value",
          RVariable: "var_currenttxn",
          ToastMessage: "Decoded CurrentTXN Hash",
          ToastPosition: ["60%", "10%"]
        },
        {
          Id: 11,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded CurrentTXN Hash value for future usage.",
          FrameId: 2,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "TXN2 CurrentTXN",
              Value: "${var_currenttxn}"
            }
          ]
        },

        // get the current txn
        {
          Id: 12,
          StepTo: 3,
          FrameTitle: "Step 3 - Retrieve Current Transaction",
          ShortFrameTitle: "Step 3",
          ActionTitle: "",
          ActionDescription:
            "Retrieve the current transaction of the gateway transaction from Stellar Blockchain.",
          FrameId: 3,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL:
            "https://horizon-testnet.stellar.org/transactions/${var_currenttxn}/operations",
          ScrollToPointer: false
        },

        {
          Id: 13,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 3,
          ActionSpeed: 2,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNCurentTXNDataString",
          ScrollToPointer: false
        },
        {
          Id: 14,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 2,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNCurentTXNDataString",
          Formater: "parseJson",
          Data: null,
          RVariable: "MainTXNCurentTXNData",
          ScrollToPointer: false
        },
        {
          Id: 15,
          StepTo: 4,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 2,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNCurentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["identifier", "value"],
          RVariable: "MainTXNCurentTXNDataIdentifier",
          ScrollToPointer: false
        },

        // highlight identifier
        {
          Id: 16,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 3,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "identifier",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        // highlight identifier value
        {
          Id: 17,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 3,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "${MainTXNCurentTXNDataIdentifier}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        {
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the base64 encoded Identifier value for future usage.",
          FrameId: 3,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "Identifier (base64)",
              Value: "${MainTXNCurentTXNDataIdentifier}"
            }
          ]
        },

        // decode identifier
        {
          Id: 18,
          FrameTitle: "Step 4 - Decode MainTXN Identifier",
          ShortFrameTitle: "Step 4 - Decode MainTXN Identifier",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 4,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html",
          ScrollToPointer: false
        },
        {
          Id: 19,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 4,
          ActionSpeed: 20,
          Type: "set-data",
          Query: ".input textarea",
          EIndex: 0,
          Selector: "value",
          Data: "${MainTXNCurentTXNDataIdentifier}"
        },
        {
          Id: 20,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 4,
          ActionSpeed: 2,
          Type: "trigger-fn",
          Query: ".btn.btn-default",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 21,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 4,
          ActionSpeed: 30,
          Type: "get-data",
          Query: ".output textarea",
          EIndex: 0,
          selector: "value",
          RVariable: "MainTXNCurentTXNDataIdentifierDecoded",
          ToastMessage: "Decoded Identifier",
          ToastPosition: ["60%", "10%"]
        },
        {
          Id: 22,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded Identifier value for future usage.",
          FrameId: 4,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "Identifier",
              Value: "${MainTXNCurentTXNDataIdentifierDecoded}"
            }
          ]
        },

        {
          Id: 23,
          StepTo: 5,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 2,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNCurentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["productId", "value"],
          RVariable: "MainTXNCurentTXNDataProductId",
          ScrollToPointer: false
        },

        // highlight Datahash
        {
          Id: 24,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 3,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "productId",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        // highlight productId value
        {
          Id: 25,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 3,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "${MainTXNCurentTXNDataProductId}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        {
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the base64 encoded Product Id value for future usage.",
          FrameId: 3,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "Product ID (base64)",
              Value: "${MainTXNCurentTXNDataProductId}"
            }
          ]
        },

        // Decode productId
        {
          Id: 26,
          FrameTitle: "Step 2 - Decode MainTXN Product Id",
          ShortFrameTitle: "Step 2 - Decode MainTXN Product Id",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product Id value",
          FrameId: 5,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html",
          ScrollToPointer: false
        },
        {
          Id: 27,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product Id value",
          FrameId: 5,
          ActionSpeed: 30,
          Type: "set-data",
          Query: ".input textarea",
          EIndex: 0,
          Selector: "value",
          Data: "${MainTXNCurentTXNDataProductId}"
        },
        {
          Id: 28,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product Id value",
          FrameId: 5,
          ActionSpeed: 2,
          Type: "trigger-fn",
          Query: ".btn.btn-default",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 29,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product Id value",
          FrameId: 5,
          ActionSpeed: 30,
          Type: "get-data",
          Query: ".output textarea",
          EIndex: 0,
          selector: "value",
          RVariable: "MainTXNCurentTXNDataProductIdDecoded",
          ToastMessage: "Decoded Product Id",
          ToastPosition: ["60%", "10%"]
        },
        {
          Id: 30,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded Product Id value for future usage.",
          FrameId: 5,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "Product ID",
              Value: "${MainTXNCurentTXNDataProductIdDecoded}"
            }
          ]
        },

        {
          Id: 31,
          StepTo: 6,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded PreviousTXN Hash value from the transaction details.",
          FrameId: 1,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["PreviousTXN", "value"],
          RVariable: "MainTXNPreviousTXN",
          ScrollToPointer: false
        },

        // Highlight Previous hash
        {
          Id: 32,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded PreviousTXN Hash value from the transaction details.",
          FrameId: 1,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "PreviousTXN",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },
        {
          Id: 33,
          StepTo: 6,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded PreviousTXN Hash value from the transaction details.",
          FrameId: 1,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "${MainTXNPreviousTXN}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        {
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the base64 encoded Previous TXN Hash value for future usage.",
          FrameId: 1,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "PreviousTXN Hash (base64)",
              Value: "${MainTXNPreviousTXN}"
            }
          ]
        },

        // Decode Previous hash
        {
          Id: 34,
          FrameTitle: "Step 7 - Decode MainTXN Previous hash",
          ShortFrameTitle: "Step 7 - Decode MainTXN Previous hash",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded MainTXN Previous hash value.",
          FrameId: 7,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html",
          ScrollToPointer: false
        },
        {
          Id: 35,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded MainTXN Previous hash value.",
          FrameId: 7,
          ActionSpeed: 20,
          Type: "set-data",
          Query: ".input textarea",
          EIndex: 0,
          Selector: "value",
          Data: "${MainTXNPreviousTXN}"
        },
        {
          Id: 36,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded MainTXN Previous hash value.",
          FrameId: 7,
          ActionSpeed: 2,
          Type: "trigger-fn",
          Query: ".btn.btn-default",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 37,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded MainTXN Previous hash value.",
          FrameId: 7,
          ActionSpeed: 30,
          Type: "get-data",
          Query: ".output textarea",
          EIndex: 0,
          selector: "value",
          RVariable: "MainTXNPreviousTXNDecoded",
          ToastMessage: "Decoded MainTXN Previous Hash",
          ToastPosition: ["60%", "10%"]
        },
        {
          Id: 38,
          FrameTitle: "",
          ActionDescription:
            "Save the decoded MainTXN Previous hash value for future usage.",
          FrameId: 7,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "PreviousTXN Hash",
              Value: "${MainTXNPreviousTXNDecoded}"
            }
          ]
        },

        // previous parts
        {
          Id: 39,
          StepTo: 7,
          FrameTitle: "Step 8 - Retrieve Backlink Transaction",
          ShortFrameTitle: "Step 8 - Retrieve Backlink Transaction",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription:
            "Retrieve the Backlink transaction from Stellar Blockchain.",
          FrameId: 8,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL:
            "https://horizon-testnet.stellar.org/transactions/${MainTXNPreviousTXNDecoded}/operations",
          ScrollToPointer: false
        },

        {
          Id: 40,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 8,
          ActionSpeed: 2,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNPreviousTXNDataString"
        },
        {
          Id: 41,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 8,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNDataString",
          Formater: "parseJson",
          Data: null,
          RVariable: "MainTXNPreviousTXNData"
        },
        {
          Id: 42,
          StepTo: 8,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded CurrentTXN Hash of the Backlink transaction from the transaction details.",
          FrameId: 2,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["CurrentTXN", "value"],
          RVariable: "MainTXNPreviousTXNCurrentTXNHash"
        },

        {
          Id: 43,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded CurrentTXN Hash of the Backlink transaction from the transaction details.",
          FrameId: 8,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "CurrentTXN",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },
        {
          Id: 44,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded CurrentTXN Hash of the Backlink transaction from the transaction details.",
          FrameId: 8,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "${MainTXNPreviousTXNCurrentTXNHash}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        {
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the base64 encoded CurrentTXN Hash value of the Previuos TXN for future usage.",
          FrameId: 8,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "CurentTXNHash (base64)",
              Value: "${MainTXNPreviousTXNCurrentTXNHash}"
            }
          ]
        },

        // decode current hash
        {
          Id: 45,
          FrameTitle: "Step 9 - Decode PreviousTXN CurentTXN Hash",
          ShortFrameTitle: "Step 9 - Decode PreviousTXN CurentTXN Hash",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded CurrentTXN Hash value from the PreviousTXN details.",
          FrameId: 9,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html",
          ScrollToPointer: false
        },
        {
          Id: 46,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded CurrentTXN Hash value from the PreviousTXN details.",
          FrameId: 9,
          ActionSpeed: 20,
          Type: "set-data",
          Query: ".input textarea",
          EIndex: 0,
          Selector: "value",
          Data: "${MainTXNPreviousTXNCurrentTXNHash}"
        },
        {
          Id: 47,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded CurrentTXN Hash value from the PreviousTXN details.",
          FrameId: 9,
          ActionSpeed: 2,
          Type: "trigger-fn",
          Query: ".btn.btn-default",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 48,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded CurrentTXN Hash value from the PreviousTXN details.",
          FrameId: 9,
          ActionSpeed: 30,
          Type: "get-data",
          Query: ".output textarea",
          EIndex: 0,
          selector: "value",
          RVariable: "MainTXNPreviousTXNCurrentTXNHashDecoded",
          ToastMessage: "Decoded PreviousTXN's CurrentTXN Hash",
          ToastPosition: ["60%", "10%"]
        },
        {
          Id: 49,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded CurrentTXN Hash value from the Backlink transaction for future usage.",
          FrameId: 9,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "CurentTXNHash",
              Value: "${MainTXNPreviousTXNCurrentTXNHashDecoded}"
            }
          ]
        },

        // BK CurrentTXNHash
        {
          Id: 50,
          StepTo: 9,
          FrameTitle: "Step 10 - Retrieve Backlink Current Transaction",
          ShortFrameTitle: "Step 10 - Retrieve Backlink Current Transaction",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription:
            "Retrieve the current transaction of the backlink transaction from Stellar Blockchain.",
          FrameId: 10,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL:
            "https://horizon-testnet.stellar.org/transactions/${MainTXNPreviousTXNCurrentTXNHashDecoded}/operations",
          ScrollToPointer: false
        },
        {
          Id: 51,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 10,
          ActionSpeed: 2,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNPreviousTXNCurrentTXNDataString",
          ScrollToPointer: false
        },
        {
          Id: 52,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 10,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNCurrentTXNDataString",
          Formater: "parseJson",
          Data: null,
          RVariable: "MainTXNPreviousTXNCurrentTXNData",
          ScrollToPointer: false
        },
        {
          Id: 53,
          StepTo: 10,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 10,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNCurrentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["identifier", "value"],
          RVariable: "MainTXNPreviousTXNCurrentTXNDataIdentifier",
          ScrollToPointer: false
        },

        {
          Id: 54,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 10,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "Identifier",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },
        {
          Id: 55,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 10,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "${MainTXNPreviousTXNCurrentTXNDataIdentifier}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        {
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the base64 encoded Identifier value of the Previuos TXN for future usage.",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "Identifier (base64)",
              Value: "${MainTXNPreviousTXNCurrentTXNDataIdentifier}"
            }
          ]
        },

        // decode current hash
        {
          Id: 56,
          FrameTitle: "Step 11 - Decode PreviousTXN's CurrentTXN'sIdentifier",
          ShortFrameTitle:
            "Step 11 - Decode PreviousTXN's CurrentTXN' Identifier",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 11,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html",
          ScrollToPointer: false
        },
        {
          Id: 57,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 11,
          ActionSpeed: 20,
          Type: "set-data",
          Query: ".input textarea",
          EIndex: 0,
          Selector: "value",
          Data: "${MainTXNPreviousTXNCurrentTXNDataIdentifier}"
        },
        {
          Id: 58,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 11,
          ActionSpeed: 2,
          Type: "trigger-fn",
          Query: ".btn.btn-default",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 59,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 11,
          ActionSpeed: 30,
          Type: "get-data",
          Query: ".output textarea",
          EIndex: 0,
          selector: "value",
          RVariable: "MainTXNPreviousTXNCurrentTXNDataIdentifierDecoded",
          ToastMessage: "Decoded Identifier",
          ToastPosition: ["60%", "10%"]
        },
        {
          Id: 60,
          FrameTitle: "",
          FrameDescription: "",
          FrameId: 11,
          ActionSpeed: 40,
          ActionDescription:
            "Save the dec3ded Identifier value for future usage.",
          Type: "save-data",
          Data: [
            {
              Key: "Identifier",
              Value: "${MainTXNPreviousTXNCurrentTXNDataIdentifierDecoded}"
            }
          ]
        },

        {
          Id: 61,
          StepTo: 11,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 10,
          ActionSpeed: 2,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNCurrentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["productId", "value"],
          RVariable: "MainTXNPreviousTXNCurrentTXNDataProductID",
          ScrollToPointer: false
        },

        {
          Id: 62,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 10,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "productId",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },
        {
          Id: 63,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 10,
          ActionSpeed: 20,
          Type: "text-style",
          HText: "${MainTXNPreviousTXNCurrentTXNDataProductID}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; display: inline-block; border-radius: 6px"
        },

        {
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the base64 encoded Product ID value of the Previuos TXN for future usage.",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "save-data",
          Data: [
            {
              Key: "Product ID (base64)",
              Value: "${MainTXNPreviousTXNCurrentTXNDataProductID}"
            }
          ]
        },

        {
          Id: 64,
          FrameTitle: "Step 12 - Decode PreviousTXN's CurrentTXN's  ProductID",
          ShortFrameTitle:
            "Step 12 - Decode PreviousTXN's CurrentTXN's ProductID",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product ID value.",
          FrameId: 12,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html",
          ScrollToPointer: false
        },
        {
          Id: 65,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product ID value.",
          FrameId: 12,
          ActionSpeed: 10,
          Type: "set-data",
          Query: ".input textarea",
          EIndex: 0,
          Selector: "value",
          Data: "${MainTXNPreviousTXNCurrentTXNDataProductID}"
        },
        {
          Id: 66,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product ID value.",
          FrameId: 12,
          ActionSpeed: 2,
          Type: "trigger-fn",
          Query: ".btn.btn-default",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 67,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product ID value.",
          FrameId: 12,
          ActionSpeed: 30,
          Type: "get-data",
          Query: ".output textarea",
          EIndex: 0,
          selector: "value",
          RVariable: "MainTXNPreviousTXNCurrentTXNDataProductIDDecoded",
          ToastMessage: "Decoded Product ID",
          ToastPosition: ["60%", "10%"]
        },
        {
          Id: 68,
          FrameTitle: "",
          FrameDescription: "",
          FrameId: 12,
          ActionSpeed: 30,
          Type: "save-data",
          ActionDescription:
            "Save the decoded Product ID value for future usage.",
          Data: [
            {
              Key: "Product ID",
              Value: "${MainTXNPreviousTXNCurrentTXNDataProductIDDecoded}"
            }
          ]
        },
        {
          Id: 69,
          StepTo: 12,
          FrameTitle: "Step 13 - Compare the base64 decoded Identifier",
          ShortFrameTitle: "Step 13 - Compare the base64 decoded Identifier",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription:
            "Compare the base64 decoded Identifier values from the transactions.",
          FrameId: 13,
          ActionSpeed: 10,
          Type: "site-screen",
          PageURL: "https://text-comparison-server.herokuapp.com",
          ScrollToPointer: false
        },
        {
          Id: 70,
          ActionTitle: "",
          ActionDescription:
            "Compare the base64 decoded Identifier values from the transactions.",
          FrameId: 13,
          ActionSpeed: 20,
          Type: "set-data",
          Query: "textarea",
          EIndex: 0,
          Selector: "value",
          Data:
            '[{"title": "Identifiers from the Main transaction and Backlink transaction", "t1": "${MainTXNCurentTXNDataIdentifierDecoded}", "t2": "${MainTXNPreviousTXNCurrentTXNDataIdentifierDecoded}"}]'
        },
        {
          Id: 71,
          ActionTitle: "",
          ActionDescription:
            "Compare the base64 decoded Identifier values from the transactions.",
          FrameId: 13,
          ActionSpeed: 10,
          Type: "trigger-fn",
          Query: "button",
          EIndex: 0,
          Event: "click",
          Data: []
        },
        {
          Id: 72,
          ActionTitle: "",
          ActionDescription:
            "Compare the base64 decoded Identifier values from the transactions.",
          FrameId: 13,
          ActionSpeed: 40,
          Type: "element-attribute",
          Query: ".comparissonBannerMargin",
          EIndex: 0,
          Attribute: "style",
          Value: "",
          ValueReplacement: 2,
          AutoScroll: true
        },
        {
          Id: 73,
          StepTo: 13,
          FrameTitle: "Step 14 - Verification Summary",
          ShortFrameTitle: "Step 14 - Verification Summary",
          FrameDescription: "",
          ActionTitle: "",
          ActionDescription:
            "Verification summary on the proof of the backlink.",
          FrameId: 14,
          ActionSpeed: 10,
          Type: "site-screen",
          InnerHTML: `
          <!DOCTYPE html>
<html>
  <head>
    <link
      href="https://www.online-html-editor.org/assets/minimalist-blocks/content.css"
      rel="stylesheet"
      type="text/css"
    />
  </head>
  <body style="height: 100vh; display: flex; justify-content: center; align-items: center;">
    <div class="container">
      <div class="row clearfix">
        <div class="column full">
          <h2
            class="size-18"
            style="font-weight: 800; text-align: center; letter-spacing: 8px; text-transform: uppercase;"
          >
            Verification summary
          </h2>
        </div>
        <div class="is-tool is-row-tool">
          <div
            class="row-handle"
            data-title="Move"
            style="width:100%;cursor:move;text-align:center;"
            title="Move"
          >
            <br />
          </div>
        </div>
        <div class="is-rowadd-tool" style="height:0;"><br /></div>
      </div>
      <div class="row clearfix">
        <div class="column full">
          <p
            class="size-12"
            style="text-align: center; letter-spacing: 3px; color: rgb(94, 94, 94); text-transform: uppercase;"
          >
            <b
              style="color: rgb(71, 88, 204); background-color: rgb(240, 249, 254);"
              >PROOF OF THE BACKLINK</b
            >
          </p>
        </div>
        <div class="is-tool is-row-tool">
          <div
            class="row-handle"
            data-title="Move"
            style="width:100%;cursor:move;text-align:center;"
            title="Move"
          >
            <br />
          </div>
        </div>
        <div class="is-rowadd-tool" style="height:0;"><br /></div>
      </div>
      <div class="row clearfix">
        <div class="column half">
          <p style="text-align: justify;">
            <strong
              ><span class="size-14">Current Transaction Hash</span></strong
            >
          </p>
          <p
            class="size-14"
            style="text-align: justify; overflow-wrap: break-word;"
          >
          \${var_currenttxn}
          </p>
        </div>
        <div class="column half">
          <p class="size-14" style="text-align: justify; ">
            <strong>Previous Transaction Hash</strong>
          </p>
          <p
            class="size-14"
            style="text-align: justify; overflow-wrap: break-word;"
          >
            \${MainTXNPreviousTXNCurrentTXNHashDecoded}
          </p>
        </div>
        <div class="is-tool is-row-tool">
          <div
            class="row-handle"
            data-title="Move"
            style="width:100%;cursor:move;text-align:center;"
            title="Move"
          >
            <br />
          </div>
        </div>
        <div class="is-rowadd-tool" style="height:0;"><br /></div>
      </div>
      <div class="row clearfix">
        <pre
          class="size-14"
          style="background-color: rgb(46, 125, 50); color: rgb(245, 243, 252); font-weight: bold; text-align: center; border-radius: 8px; margin: 0; padding: 8px;"
        >
Verification Completed</pre
        >
        <div class="is-rowadd-tool" style="height:0;"><br /></div>
      </div>
    </div>
  </body>
</html>

          `,
          PageURL: "about: Verification Summary - PROOF OF THE BACKLINK",
          ScrollToPointer: false
        }
      ]
    };
  }
  verifyBackLinkVerify() {
    return {
      // 1 site-screen TXNHash2 - F1
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
