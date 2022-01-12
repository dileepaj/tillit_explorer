import { trigger, style, animate, transition } from "@angular/animations";
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { VerificationServiceService } from "../../../../services/verification-service.service";
import URL from "url-parse";


@Component({
  selector: "app-site-screen",
  templateUrl: "./site-screen.component.html",
  styleUrls: ["./site-screen.component.css"],
  animations: [
    trigger("spinAnimation", [
      transition(":enter", [
        style({ transform: "translateY(-200%)", opacity: 0 }),
        animate("500ms", style({ transform: "translateY(0%)", opacity: 1 }))
      ]),
      transition(":leave", [
        style({ transform: "translateY(0%)", opacity: 1 }),
        animate("500ms", style({ transform: "translateY(-400%)", opacity: 0 }))
      ])
    ]),
    trigger("iframeAnimation", [
      transition(":enter", [
        style({ transform: "translateY(100%)", opacity: 1 }),
        animate("1000ms", style({ transform: "translateY(0%)", opacity: 1 }))
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
export class SiteScreenComponent implements OnInit {
  text: string = "";
  HTMLData: string = "";
  displayPageUrl: any = "Search or type a URL...";
  pageUrl: SafeResourceUrl;
  loadingComplete: boolean = false;
  isCopied: boolean = false;
  scale: number = 1;

  @ViewChild("iframe", { read: ElementRef, static: false }) iframe: ElementRef;

  constructor(
    private verificationHttpService: VerificationServiceService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  scrollToQuery(query: string) {
    const iframe = this.iframe.nativeElement;
    this.scrollToDemoFrame();
    const left = iframe.offsetLeft;
    console.log(left, iframe.scrollWidth);
    // document.getElementById("verificationScreen").scrollLeft =
    //   left - iframe.scrollWidth;
    const currentFrame = iframe.contentWindow;
    const outputFrame = iframe.contentWindow.document
      .querySelectorAll(query)[0]
      .getBoundingClientRect();
    // iframe.contentWindow.scrollTo(
    //   currentFrame.scrollX + outputFrame.x,
    //   currentFrame.scrollY + outputFrame.y
    // );
  }

  private scrollToDemoFrame() {
    const bodyRect: any = document.body.getBoundingClientRect();
    const pcRect: any = document
      .getElementById("proofContainer")
      .getBoundingClientRect();
    const pcWidth = pcRect.x - bodyRect.x;
    const pcHeight = pcRect.y - bodyRect.y;
    window.scroll(pcWidth, pcHeight);
  }

  setPage(pageUrl: string) {
    setTimeout(() => {
      // this.pageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pageUrl);
      this.displayPageUrl = pageUrl;
      this.verificationHttpService.loadPage(pageUrl).subscribe(
        data => {
          var domainUrl = pageUrl
            .split("/")
            .filter(n => n)
            .join("/");
          if (
            pageUrl
              .split("/")
              .slice(-1)[0]
              .search(".") != -1
          )
            domainUrl = pageUrl
              .split("/")
              .slice(0, -1)
              .join("/");
          this.HTMLData = data.replace(
            /href="(?!http)[\/]?/g,
            `href="${domainUrl}/`
          );
          this.HTMLData = this.HTMLData.replace(
            /src="(?!http)[\/]?/g,
            `href="${domainUrl}/`
          );
          let doc = this.iframe.nativeElement.contentDocument;
          doc.open();
          doc.write(this.HTMLData);
          // doc.write(this.sanitizer.bypassSecurityTrustHtml(data));
          // execute srcipts
          const scripts = doc.getElementsByTagName("script");
          for (let script of scripts) {
            this.iframe.nativeElement.contentWindow.eval(script.text);
          }

          doc.close();
          // this.HTMLData = data;

          //  setTimeout(()=> {
          //     const scripts = this.iframe.nativeElement.contentWindow.document.getElementsByTagName("script");
          //     const mainUrl = new URL(this.displayPageUrl);
          //     console.log(mainUrl);
          //     var scriptList = Array.prototype.slice.call(scripts);
          //     scriptList.forEach(customize);
          //     function customize(script, index, ar) {
          //       var upUrl = new URL(script.src);
          //       var newScript = document.createElement("script");
          //       newScript.type = "text/javascript";
          //       newScript.innerHTML = script.innerHTML;
          //       newScript.src = mainUrl.origin + "/online-tools" + upUrl.pathname;
          //       doc.body.appendChild(newScript);
          //     }
          //  }, 8000)
        },
        err => {
          console.log(err);
        }
      );
    }, 1400);
  }

  onIframeLoadFn() {
    this.loadingComplete = true;
  }

  openInNewWindowFn() {
    if (this.pageUrl) window.open(this.displayPageUrl);
  }

  copyToClipboardFn() {
    if (this.pageUrl || this.HTMLData) {
      const selBox = document.createElement("textarea");
      selBox.style.position = "fixed";
      selBox.style.left = "0";
      selBox.style.top = "0";
      selBox.style.opacity = "0";
      selBox.value = this.displayPageUrl;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand("copy");
      document.body.removeChild(selBox);
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 2000);
    }
  }

  scaleFn(x: number) {
    var w = this.iframe.nativeElement.offsetWidth;
    var h = this.iframe.nativeElement.offsetHeight;
    w = 632;
    h = 324;
    if (x === -1) {
      this.scale = this.scale * 1.1;
      w = w * 0.9;
      h = h * 0.9;
      this.renderer.setStyle(this.iframe.nativeElement, "width", `${w}px`);
      this.renderer.setStyle(this.iframe.nativeElement, "height", `${h}px`);
    } else {
      this.scale = this.scale * 0.9;
      w = w * 1.1;
      h = h * 1.1;
      this.renderer.setStyle(this.iframe.nativeElement, "width", `${w}px`);
      this.renderer.setStyle(this.iframe.nativeElement, "height", `${h}px`);
    }
    this.renderer.setStyle(
      this.iframe.nativeElement,
      "transform",
      `scale(${this.scale})`
    );
  }
}
