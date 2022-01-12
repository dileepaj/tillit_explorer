import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { SiteScreenComponent } from '../components/site-screen/site-screen.component';


@Component({
  selector: "app-verification-screen",
  templateUrl: "./verification-screen.component.html",
  styleUrls: ["./verification-screen.component.css"]
})
export class VerificationScreenComponent implements OnInit {
  demoScreenChildRefs: Object[] = [];
  @ViewChild("ProofDemoDirective", { read: ViewContainerRef, static: false })
  proofDemoRef: ViewContainerRef;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.scrollToDemoFrame();
    const screenComponentRef: ComponentRef<SiteScreenComponent> = this.createFrameInProofDemo(
      "site-screen"
    );
    
    setTimeout(
      () =>
        screenComponentRef.instance.setPage(
          "https://emn178.github.io/online-tools/base64_decode.html"
        ),
      1000
    );

    setTimeout(
      () => {
        const screenComponentRef: ComponentRef<SiteScreenComponent> = this.createFrameInProofDemo(
          "site-screen"
        );
        screenComponentRef.instance.setPage(
          "https://emn178.github.io/online-tools/base64_decode.html"
        );
        setTimeout(
                  () => screenComponentRef.instance.scrollToQuery(".output"),
                  14000
                );
      },
      2000
    );

    setTimeout(
      () => {
        const screenComponentRef: ComponentRef<SiteScreenComponent> = this.createFrameInProofDemo(
          "site-screen"
        );
        screenComponentRef.instance.setPage(
          "https://emn178.github.io/online-tools/base64_decode.html"
        );
      },
      3000
    );

    this.cdr.detectChanges();
  }

  scrollToDemoFrame() {
    const bodyRect: any = document.body.getBoundingClientRect();
    const pcRect: any = document
      .getElementById("proofContainer")
      .getBoundingClientRect();
    const pcWidth = pcRect.x - bodyRect.x;
    const pcHeight = pcRect.y - bodyRect.y;
    setTimeout(() => window.scroll(pcWidth, pcHeight), 600);
  }

  createFrameInProofDemo(type: string): ComponentRef<any> {
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
    return ref;
  }
}
