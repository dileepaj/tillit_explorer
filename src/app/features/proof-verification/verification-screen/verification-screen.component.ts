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
import { SiteScreenComponent } from "../components/site-screen/site-screen.component";

@Component({
  selector: "app-verification-screen",
  templateUrl: "./verification-screen.component.html",
  styleUrls: ["./verification-screen.component.css"]
})
export class VerificationScreenComponent implements OnInit {
  gsHeightExpand: boolean = false;
  vsHeightExpand: boolean = false;

  demoScreenChildRefs: Object[] = [];
  @ViewChild("ProofDemoDirective", { read: ViewContainerRef, static: false })
  proofDemoRef: ViewContainerRef;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    this.scrollToFrameById("proofContainer");
    await new Promise(resolve3 => setTimeout(resolve3, 3200));
    const screenComponentRef: ComponentRef<SiteScreenComponent> = await this.createFrameInProofDemo(
      "site-screen"
    );
    await screenComponentRef.instance.setPage(
      "https://emn178.github.io/online-tools/base64_decode.html"
    );
    // screenComponentRef.instance.addAttributeToElement(
    //   "body",
    //   0,
    //   0,
    //   "style",
    //   "pointer-events: none;cursor: pointer;"
    // );
    await new Promise(resolve => setTimeout(resolve, 3200));
    const screenComponentRef2: ComponentRef<SiteScreenComponent> = await this.createFrameInProofDemo(
      "site-screen"
    );
    await screenComponentRef2.instance.setPage(
      "https://emn178.github.io/online-tools/base64_decode.html"
    );
    await screenComponentRef2.instance.scrollToSelector(".output");
    await new Promise(resolve2 => setTimeout(resolve2, 3200));

    const screenComponentRef3: ComponentRef<SiteScreenComponent> = await this.createFrameInProofDemo(
      "site-screen"
    );
    await screenComponentRef3.instance.setPage(
      "https://emn178.github.io/online-tools/base64_decode.html"
    );
    await screenComponentRef3.instance.scrollToSelector(".output");
    screenComponentRef3.instance.styleText("Base64", false, 1, "color: yellow");
    await new Promise(resolve3 => setTimeout(resolve3, 3200));

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

  async createFrameInProofDemo(type: string): Promise<ComponentRef<any>> {
    var component: Type<any>;
    switch (type) {
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
    this.demoScreenChildRefs.push({ type, ref });
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
}
