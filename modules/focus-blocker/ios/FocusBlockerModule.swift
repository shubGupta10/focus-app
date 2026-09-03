import ExpoModulesCore

public class FocusBlockerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FocusBlocker")

    Events("onChange")

    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }
  }
}
