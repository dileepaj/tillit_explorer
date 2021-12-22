import { trigger, style, animate, transition } from "@angular/animations";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { VerificationServiceService } from "../../../../services/verification-service.service";

@Component({
  selector: "app-site-screen",
  templateUrl: "./site-screen.component.html",
  styleUrls: ["./site-screen.component.css"],
  animations: [
    trigger("screenAnimation", [
      transition(":enter", [
        style({ transform: "translateY(400px)", opacity: 0 }),
        animate("800ms", style({ transform: "translateY(0%)", opacity: 1 }))
      ])
    ]),
    trigger("spinAnimation", [
      transition(":enter", [
        style({ transform: "translateY(-100%)", opacity: 0 }),
        animate("2000ms", style({ transform: "translateY(0px)", opacity: 1 }))
      ]),
      transition(":leave", [
        style({ transform: "translateY(0px)", opacity: 1 }),
        animate("800ms", style({ transform: "translateY(-100%)", opacity: 0 }))
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
  loadingComplete: boolean = false;
  isCopied: boolean = false;
  FrameTitle: string = "";
  scale: number = 1;
  scrolling: string = "no";

  @ViewChild("iframe", { read: ElementRef, static: false }) iframe: ElementRef;

  constructor(
    private verificationHttpService: VerificationServiceService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private cdref: ChangeDetectorRef,
    private elRef: ElementRef
  ) {}

  ngOnInit() {}

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  async scrollIntoView() {
    await this.scrollToFrameById("verificationScreen", 10);
    document.querySelectorAll("#verificationScreen #frames")[0].scroll({
      top: 0,
      left: this.elRef.nativeElement.offsetLeft,
      behavior: "smooth"
    });
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
  }

  async scrollToSelector(query: string, index: number = 0, lower: number = 0) {
    await this.scrollIntoView();
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
    const iframe = this.iframe.nativeElement;
    const currentFrame = iframe.contentWindow;
    const selectorFrame = iframe.contentWindow.document
      .querySelectorAll(query)
      [index].getBoundingClientRect();
    iframe.contentWindow.scroll({
      top: currentFrame.scrollY + selectorFrame.y - lower,
      left: currentFrame.scrollX + selectorFrame.x,
      behavior: "smooth"
    });
    await new Promise(resolveTime => setTimeout(resolveTime, 400));
  }

  async scrollToFrameById(frameID: string, lower = 0) {
    const bodyRect: any = document.body.getBoundingClientRect();
    const pcRect: any = document
      .getElementById(frameID)
      .getBoundingClientRect();
    const pcWidth = pcRect.x - bodyRect.x;
    const pcHeight = pcRect.y - bodyRect.y;
    var visibleDoc = bodyRect.top + bodyRect.height;
    var visiblPC = pcRect.height * 0.5 + pcRect.top;
    var top = pcHeight - (bodyRect.height - pcRect.height);
    // console.log(pcRect.top, bodyRect.top);
    // console.log(visibleDoc, visiblPC, visibleDoc - visiblPC);
    if (visibleDoc - visiblPC < 0) {
      window.scroll({
        top,
        left: pcWidth,
        behavior: "smooth"
      });
      await new Promise(resolveTime => setTimeout(resolveTime, 400));
    }
  }

  async setPage(pageUrl: string) {
    await this.scrollIntoView();
    this.loadingComplete = false;
    this.HTMLData = null;
    await new Promise(resolveTime => setTimeout(resolveTime, 1400));
    return new Promise(async (resolve, reject) => {
      this.displayPageUrl = pageUrl;
      this.verificationHttpService.loadPage(pageUrl).subscribe(
        async data => {
          await new Promise(resolveTime => setTimeout(resolveTime, 2200));
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
            /src="(?!http)[\/]?/g,
            `src="${domainUrl}/`
          );
          this.HTMLData = this.HTMLData.replace(
            /href="(?!http)[\/]?/g,
            `href="${domainUrl}/`
          );
          var el = document.createElement("html");
          el.innerHTML = this.HTMLData;
          var existingValue = el
            .getElementsByTagName("body")[0]
            .getAttribute("style");
          var css = "pointer-events: none; cursor: pointer";
          el.getElementsByTagName("body")[0].setAttribute(
            "style",
            existingValue ? ";" + css : css
          );
          let doc = this.iframe.nativeElement.contentDocument;
          doc.open();
          this.loadingComplete = true;
          doc.write(el.innerHTML);
          doc.close();
          this.iframe.nativeElement.animate(
            [
              { transform: "translateY(400px)", opacity: 0 },
              { transform: "translateY(0px)", opacity: 1 }
            ],
            {
              duration: 900
            }
          );
          await new Promise(resolveTime => setTimeout(resolveTime, 1200));
          resolve({ ref: this.iframe });
        },
        error => reject({ error, ref: this.iframe })
      );
    });
  }

  setFrameTitle(title: string) {
    this.FrameTitle = title;
  }

  // style an element
  addAttributeToElement(
    selectQuery: string,
    index: number,
    replace: number,
    attribute: string,
    value: string
  ) {
    var document = this.iframe.nativeElement.contentDocument;
    const exsitingValue = document
      .querySelectorAll(selectQuery)
      [index].getAttribute(attribute);
    switch (replace) {
      case 0:
        document
          .querySelectorAll(selectQuery)
          [index].setAttribute(attribute, value);
        break;

      case 1:
        document
          .querySelectorAll(selectQuery)
          [index].setAttribute(
            attribute,
            exsitingValue ? exsitingValue + ";" + value : value
          );
        break;

      case 2:
        document
          .querySelectorAll(selectQuery)
          [index].setAttribute(attribute, value + exsitingValue);
        break;

      default:
        break;
    }
  }

  async styleText(
    text: string,
    caseSensitive: boolean,
    index: number,
    css: string
  ) {
    let doc = this.iframe.nativeElement.contentDocument;
    let html = doc.documentElement.innerHTML;
    var indexes = this.getIndicesOf(text, html, caseSensitive);
    if (indexes && indexes.length > 0) {
      var id = (Math.random() + 1).toString(36).substring(7);
      html =
        html.substring(0, indexes[index]) +
        `<span id="cs_${id}" style="${css}">` +
        html.substring(indexes[index], indexes[index] + text.length) +
        "</span>" +
        html.substring(indexes[index] + text.length);
      doc.open();
      doc.write(html);
      doc.close();
      await this.scrollToSelector(`#cs_${id}`, 0, this.getHeight() / 2);
    }
  }

  getHeight(): number {
    return this.iframe.nativeElement.getBoundingClientRect().height;
  }

  async getData(query: string, index: number, selector: string) {
    await this.scrollToSelector(query, index, this.getHeight() / 2);
    return this.iframe.nativeElement.contentDocument.documentElement.querySelectorAll(
      query
    )[index][selector];
  }

  async setData(query: string, index: number, selector: string, data: string) {
    this.iframe.nativeElement.contentDocument.body.querySelectorAll(query)[
      index
    ][selector] = data;
    await this.scrollToSelector(query, index, this.getHeight() / 2);
  }

  async triggerFunction(
    query: string,
    index: number,
    event: string,
    data: any[] = []
  ) {
    var el = this.iframe.nativeElement.contentDocument.body.querySelectorAll(
      query
    )[index];
    await this.scrollToSelector(query, index, this.getHeight() / 2);
    return el[event](...data);
  }

  getIndicesOf(searchStr: string, str: string, caseSensitive: boolean) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
      return [];
    }
    var startIndex = 0,
      index: number,
      indices = [];
    if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  loadFn2(pageUrl: string) {
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
            /src="(?!http)[\/]?/g,
            `src="${domainUrl}/`
          );
          this.HTMLData = this.HTMLData.replace(
            /href="(?!http)[\/]?/g,
            `href="${domainUrl}/`
          );
          let doc = this.iframe.nativeElement.contentDocument;
          doc.open();
          doc.write(this.HTMLData);
          // doc.write(this.sanitizer.bypassSecurityTrustHtml(data));
          // execute srcipts
          // const scripts = doc.getElementsByTagName("script");
          // for (let script of scripts) {
          //   this.iframe.nativeElement.contentWindow.eval(script.text);
          // }

          // var scriptElm = document.createElement("script");
          // var inlineCode = document.createTextNode('alert("hello world")');
          // scriptElm.appendChild(inlineCode);
          // doc.documentElement.appendChild(scriptElm);

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

  ngAfterViewInit() {
    let scripts = this.iframe.nativeElement.getElementsByTagName("script");

    for (let script of scripts) {
      eval(script.text);
    }

    // eval(scripts[0].text);
  }

  openInNewWindowFn() {
    if (this.displayPageUrl) window.open(this.displayPageUrl);
  }

  copyToClipboardFn() {
    if (this.displayPageUrl) {
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
