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
import Swal from "sweetalert2";


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

  scrollToText(text: string) {
    this.text = text;
  }

  setPage(pageUrl: string) {
    setTimeout(() => {
      this.pageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pageUrl);
      this.displayPageUrl = pageUrl;
    }, 1400);
  }

  onIframeLoadFn() {
    this.loadingComplete = true;
  }

  openInNewWindowFn() {
    if (this.pageUrl) window.open(this.displayPageUrl);
  }

  copyToClipboardFn() {
    if (this.pageUrl) {
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
      Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: false,
        didOpen: toast => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        }
      }).fire({
        icon: "success",
        title: "Copied to ClipBoard"
      });
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
    this.renderer.setStyle(this.iframe.nativeElement, "transform", `scale(${this.scale})`);
  }
}
