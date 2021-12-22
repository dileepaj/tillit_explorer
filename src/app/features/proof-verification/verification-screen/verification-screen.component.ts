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
    ])
  ]
})
export class VerificationScreenComponent implements OnInit {
  StorageTitle: string = "Storage";
  ProofContainerTitle: string = "Proof Container";
  currentStep: number = 0;
  totalSteps: number = 0;
  gsHeightExpand: boolean = false;
  vsHeightExpand: boolean = false;
  isStartDemo: boolean = false;
  isPause: boolean = false;
  isReplay: boolean = false;
  isLoading: boolean = false;
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
  txnId: string = "";

  @ViewChild("ProofDemoDirective", { read: ViewContainerRef, static: false })
  proofDemoRef: ViewContainerRef;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {}

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
    const ref = this.proofDemoRef.createComponent(componentFactory);
    this.demoScreenChildRefs[FrameId] = {
      Id: FrameId,
      type: Type,
      ref,
      ShortFrameTitle
    };
    ref.location.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start"
    });
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
    this.playProofDemo();
  }

  replayFn() {
    this.currentStep = 0;
    this.gsHeightExpand = false;
    this.vsHeightExpand = false;
    this.isStartDemo = true;
    this.isPause = false;
    this.isLoading = false;
    this.variableStorage = {};
    this.globalData = [];
    this.demoScreenChildRefs = {};
    this.steppers = [];
    this.proofDemoRef.clear();
    this.cdr.detectChanges();
    this.playProofDemo();
  }

  async startDemoFn() {
    this.txnId = this.route.snapshot.paramMap.get('txnhash');
    this.isLoading = true;
    await new Promise(resolveTime => setTimeout(resolveTime, 4200));
    this.isStartDemo = true;
    this.isPause = true;
    this.initiateProofDemo();
    await new Promise(resolveTime => setTimeout(resolveTime, 600));
    this.isPause = false;
    this.playProofDemo(0);
  }

  stopFn() {
    this.StorageTitle = "Storage";
    this.ProofContainerTitle = "Proof Container";
    this.currentStep = 0;
    this.totalSteps = 0;
    this.gsHeightExpand = false;
    this.vsHeightExpand = false;
    this.isStartDemo = false;
    this.isPause = false;
    this.isReplay = false;
    this.isLoading = false;
    this.variableStorage = {};
    this.proofJSON = {};
    this.globalData = [];
    this.demoScreenChildRefs = {};
    this.steppers = [];
    this.proofDemoRef.clear();
    this.cdr.detectChanges();
  }

  initiateProofDemo() {
    this.proofJSON = this.getSampleUI();
    this.playProofDemo(0);
  }

  async playProofDemo(step: number = this.currentStep) {
    const data = this.proofJSON;
    this.currentStep = step;
    this.StorageTitle = data.StorageTitle;
    this.ProofContainerTitle = data.ProofContainerTitle;
    this.totalSteps = data.Actions.length;
    this.steppers = data.Steppers;
    this.cdr.detectChanges();
    this.isReplay = false;
    for (; this.currentStep < data.Actions.length; this.currentStep++) {
      if (this.isPause) break;
      if (this.isReplay) break;
      const action = this.parseActionData(data.Actions[this.currentStep]);
      this.ActionDescription = action.ActionDescription;
      if (action.StepTo) {
        this.toStepper(action.StepTo);
      }
      const frameID = action.FrameId;
      this.cdr.detectChanges();
      switch (action.Type) {
        case "site-screen":
          var scRef: ComponentRef<SiteScreenComponent>;
          if (this.demoScreenChildRefs[frameID])
            scRef = this.demoScreenChildRefs[frameID].ref;
          else scRef = await this.createFrameInProofDemo(action);

          if (scRef && action.PageURL) {
            scRef.instance.setFrameTitle(action.FrameTitle);
            await scRef.instance.setPage(action.PageURL);
          }
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
      this.cdr.detectChanges();
      await new Promise(resolveTime =>
        setTimeout(
          resolveTime,
          100 * (action.ActionSpeed ? action.ActionSpeed : 1)
        )
      );
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
    const el: any =  allSteps[no - 1];
    el.classList.add("glow");
    // allSteps[no - 1].scrollIntoView();
    steppersFrame.scroll({
      top:  0,
      left: el.offsetLeft - steppersFrame.getBoundingClientRect().width + el.getBoundingClientRect().width,
      behavior: "smooth"
    });
    for (let index = 0; index < no - 1; index++) {
      allSteps[index].classList.remove("glow");
      allSteps[index].classList.add("success");
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
    await this.scrollToFrameById("globalInformation", 10);
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
    if (index == -1)
      this.globalData.push({
        Id,
        Title,
        Data
      });
    else {
      const curr: any = this.globalData[index];
      curr.Data = [...curr.Data, ...Data];
      this.globalData = [
        ...this.globalData.slice(0, index),
        curr,
        ...this.globalData.slice(index + 1)
      ];
    }
    this.cdr.detectChanges();
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
    await this.scrollIntoStorageView(Id);
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

  getSampleUI() {
    return {
      Title: "",
      Description: "",
      StorageTitle: "Information Storage",
      ProofContainerTitle: "",
      NoOfFrames: 4,
      NoOFActions: 40,
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
          Name: "Conclusion"
        }
      ],
      Actions: [
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL:
            `https://horizon-testnet.stellar.org/transactions/${this.txnId}/operations`
        },
        {
          Id: 2,
          ActionTitle: "",
          ActionDescription:
            "Format transaction data to JSON (Javascript Object Notation)",
          FrameId: 1,
          ActionSpeed: 30,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNData"
        },
        {
          Id: 3,
          ActionTitle: "",
          ActionDescription:
            "Format transaction data to JSON (Javascript Object Notation)",
          FrameId: 2,
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNData",
          Formater: "parseJson",
          Data: null,
          RVariable: "MainTXNData"
        },
        {
          Id: 4,
          StepTo: 2,
          ActionTitle: "",
          ActionDescription:
            "Select the CurrentTXN Hash (base64 encoded) from the transaction details.",
          FrameId: 2,
          ActionSpeed: 30,
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
          ActionSpeed: 30,
          Type: "text-style",
          HText: "CurrentTXN",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
        },
        {
          Id: 6,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded CurrentTXN Hash from the transaction details.",
          FrameId: 1,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "${MainTXNCurentTXNHash}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html"
        },
        {
          Id: 8,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded CurrentTXN Hash value.",
          FrameId: 2,
          ActionSpeed: 30,
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
          ActionSpeed: 30,
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
          RVariable: "var_currenttxn"
        },
        {
          Id: 11,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded CurrentTXN Hash value for future usage.",
          FrameId: 2,
          ActionSpeed: 60,
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL:
            "https://horizon-testnet.stellar.org/transactions/${var_currenttxn}/operations"
        },

        {
          Id: 13,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 3,
          ActionSpeed: 30,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNCurentTXNData"
        },
        {
          Id: 14,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 2,
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNCurentTXNData",
          Formater: "parseJson",
          Data: null,
          RVariable: "MainTXNCurentTXNData"
        },
        {
          Id: 15,
          StepTo: 4,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 2,
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNCurentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["identifier", "value"],
          RVariable: "MainTXNCurentTXNDataIdentifier"
        },

        // highlight identifier
        {
          Id: 16,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 3,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "identifier",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
        },

        // highlight identifier value
        {
          Id: 17,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 3,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "${MainTXNCurentTXNDataIdentifier}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html"
        },
        {
          Id: 19,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 4,
          ActionSpeed: 30,
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
          ActionSpeed: 30,
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
          RVariable: "MainTXNCurentTXNDataIdentifierDecoded"
        },
        {
          Id: 22,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded Identifier value for future usage.",
          FrameId: 4,
          ActionSpeed: 60,
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
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNCurentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["productId", "value"],
          RVariable: "MainTXNCurentTXNDataProductId"
        },

        // highlight Datahash
        {
          Id: 24,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 3,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "productId",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
        },

        // highlight productId value
        {
          Id: 25,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 3,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "${MainTXNCurentTXNDataProductId}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html"
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
          ActionSpeed: 30,
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
          RVariable: "MainTXNCurentTXNDataProductIdDecoded"
        },
        {
          Id: 30,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded Product Id value for future usage.",
          FrameId: 5,
          ActionSpeed: 60,
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
          ActionSpeed: 60,
          Type: "format-data",
          Variable: "MainTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["PreviousTXN", "value"],
          RVariable: "MainTXNPreviousTXN"
        },

        // Highlight Previous hash
        {
          Id: 32,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded PreviousTXN Hash value from the transaction details.",
          FrameId: 1,
          ActionSpeed: 40,
          Type: "text-style",
          HText: "PreviousTXN",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
        },
        {
          Id: 33,
          StepTo: 6,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded PreviousTXN Hash value from the transaction details.",
          FrameId: 1,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "${MainTXNPreviousTXN}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
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
          ActionSpeed: 50,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html"
        },
        {
          Id: 35,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded MainTXN Previous hash value.",
          FrameId: 7,
          ActionSpeed: 30,
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
          ActionSpeed: 30,
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
          RVariable: "MainTXNPreviousTXNDecoded"
        },
        {
          Id: 38,
          FrameTitle: "",
          ActionDescription:
            "Save the decoded MainTXN Previous hash value for future usage.",
          FrameId: 7,
          ActionSpeed: 40,
          Type: "save-data",
          Data: [
            {
              Key: "Previoushash",
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL:
            "https://horizon-testnet.stellar.org/transactions/${MainTXNPreviousTXNDecoded}/operations"
        },

        {
          Id: 40,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 8,
          ActionSpeed: 30,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNPreviousTXNData"
        },
        {
          Id: 41,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 8,
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNData",
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
          ActionSpeed: 30,
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
          ActionSpeed: 30,
          Type: "text-style",
          HText: "CurrentTXN",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
        },
        {
          Id: 44,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded CurrentTXN Hash of the Backlink transaction from the transaction details.",
          FrameId: 8,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "${MainTXNPreviousTXNCurrentTXNHash}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html"
        },
        {
          Id: 46,
          ActionTitle: "",
          ActionDescription:
            "Decode the base64 encoded CurrentTXN Hash value from the PreviousTXN details.",
          FrameId: 9,
          ActionSpeed: 30,
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
          ActionSpeed: 30,
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
          RVariable: "MainTXNPreviousTXNCurrentTXNHashDecoded"
        },
        {
          Id: 49,
          FrameTitle: "",
          FrameDescription: "",
          ActionDescription:
            "Save the decoded CurrentTXN Hash value from the Backlink transaction for future usage.",
          FrameId: 9,
          ActionSpeed: 60,
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL:
            "https://horizon-testnet.stellar.org/transactions/${MainTXNPreviousTXNCurrentTXNHashDecoded}/operations"
        },

        {
          Id: 51,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "get-data",
          Query: "body",
          EIndex: 0,
          selector: "innerText",
          RVariable: "MainTXNPreviousTXNCurrentTXNData"
        },
        {
          Id: 52,
          ActionTitle: "",
          ActionDescription: "Parse transaction data to JSON",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNCurrentTXNData",
          Formater: "parseJson",
          Data: null,
          RVariable: "MainTXNPreviousTXNCurrentTXNData"
        },
        {
          Id: 53,
          StepTo: 10,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNCurrentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["identifier", "value"],
          RVariable: "MainTXNPreviousTXNCurrentTXNDataIdentifier"
        },

        {
          Id: 54,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "Identifier",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
        },
        {
          Id: 55,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Identifier from the transaction details.",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "${MainTXNPreviousTXNCurrentTXNDataIdentifier}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html"
        },
        {
          Id: 57,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Identifier value.",
          FrameId: 11,
          ActionSpeed: 30,
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
          ActionSpeed: 30,
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
          RVariable: "MainTXNPreviousTXNCurrentTXNDataIdentifierDecoded"
        },
        {
          Id: 60,
          FrameTitle: "",
          FrameDescription: "",
          FrameId: 11,
          ActionSpeed: 60,
          ActionDescription:
            "Save the decoded Identifier value for future usage.",
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
          ActionSpeed: 30,
          Type: "format-data",
          Variable: "MainTXNPreviousTXNCurrentTXNData",
          Formater: "jsonValueObjectPicker",
          Data: ["productId", "value"],
          RVariable: "MainTXNPreviousTXNCurrentTXNDataProductID"
        },

        {
          Id: 62,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "productId",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
        },
        {
          Id: 63,
          ActionTitle: "",
          ActionDescription:
            "Select the encoded Product ID from the transaction details.",
          FrameId: 10,
          ActionSpeed: 30,
          Type: "text-style",
          HText: "${MainTXNPreviousTXNCurrentTXNDataProductID}",
          CaseSensitive: true,
          TextIndex: 0,
          StyleCSS:
            "background-color: blue; color: white; padding: 4px 8px; margin: 2px; font-weight: bold; font-size: 14px; display: inline-block; border-radius: 6px"
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
          ActionSpeed: 30,
          Type: "site-screen",
          PageURL: "https://emn178.github.io/online-tools/base64_decode.html"
        },
        {
          Id: 65,
          ActionTitle: "",
          ActionDescription: "Decode the base64 encoded Product ID value.",
          FrameId: 12,
          ActionSpeed: 30,
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
          ActionSpeed: 30,
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
          RVariable: "MainTXNPreviousTXNCurrentTXNDataProductIDDecoded"
        },
        {
          Id: 68,
          FrameTitle: "",
          FrameDescription: "",
          FrameId: 12,
          ActionSpeed: 60,
          Type: "save-data",
          ActionDescription:
            "Save the decoded Product ID value for future usage.",
          Data: [
            {
              Key: "Product ID",
              Value: "${MainTXNPreviousTXNCurrentTXNDataProductIDDecoded}"
            }
          ]
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
